import * as React from "react";

import { v4 as uuidv4 } from "uuid";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  ClickAwayListener,
  IconButton,
  TextField,
  Checkbox,
  Menu,
  MenuItem,
  Button,
  LinearProgress,
  Stack,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from "@mui/material";

import {
  Add,
  ChatBubble,
  CloseFullscreen,
  DeleteForever,
  Done,
  MoreVert,
  AccountTree,
  PriorityHigh,
  SortRounded,
  Restore,
  ContentPasteOutlined,
  ContentCopy,
  LinkOutlined,
  Bolt,
  HourglassTop,
  CalendarToday,
} from "@mui/icons-material";
import { useState } from "react";

type AccordionItem = {
  id: string;
  label: string;
  checked?: boolean;
  description?: string;
  critical?: boolean;
  time?: string;
  children?: AccordionItem[];
};
import Flow from "../Flow/Flow";
import Sortable from "../Sortable/Sortable";

interface MyAccordionProps {
  passedItems: {
    items: AccordionItem[];
    deleted?: { item: AccordionItem; parentId: string }[];
  };
  itemsChangedCallback: (
    items: AccordionItem[],
    deleted?: { item: AccordionItem; parentId: string }[]
  ) => void;
}

function countCheckedAndTotalChildren(items: AccordionItem[] | undefined): {
  checkedCount: number;
  totalChildren: number;
  uncheckedChildrenLabels: string[] | undefined;
  containsCritical: boolean;
} {
  let checkedCount = 0;
  let totalChildren = 0;

  if (!items || items.length === 0) {
    return {
      checkedCount,
      totalChildren,
      uncheckedChildrenLabels: undefined,
      containsCritical: false,
    };
  }

  let containsCritical = false;
  const uncheckedChildrenLabels: string[] = [];

  const recursiveCount = (items: AccordionItem[]) => {
    items.forEach((item) => {
      if (item.children) {
        recursiveCount(item.children);
      } else {
        totalChildren++;
        if (item.checked) {
          checkedCount++;
        } else {
          uncheckedChildrenLabels.push(item.label);
        }
        if (item.critical && !item.checked) {
          containsCritical = true;
        }
      }
    });
  };

  recursiveCount(items);
  return {
    checkedCount,
    totalChildren,
    uncheckedChildrenLabels,
    containsCritical,
  };
}
export default function MyAccordion(props: MyAccordionProps) {
  const [jsonitems, setItems] = React.useState(
    props.passedItems.items as AccordionItem[]
  );
  const [deleted, setDeleted] = useState(props.passedItems.deleted);
  React.useEffect(() => {
    setItems(props.passedItems.items);
  }, [props.passedItems.items]);
  React.useEffect(() => {
    setDeleted(props.passedItems.deleted);
  }, [props.passedItems.deleted]);
  const [menuOptions, setMenuOptions] = useState<any[]>([]);

  function handleAddNewSubItem(
    parentId: string,

    restoreItem?: AccordionItem,
    updatedDeletedList?: { item: AccordionItem; parentId: string }[]
  ) {
    const newItem: AccordionItem = restoreItem
      ? restoreItem
      : {
          id: uuidv4(),
          label: "New Item",
          checked: false,
        };
    if (parentId === "") {
      jsonitems.push(newItem);
      setItems([...jsonitems]);
    } else {
      const addNewItem = (items: AccordionItem[]) => {
        return items.map((item) => {
          if (item.id === parentId) {
            console.log("FOUND PARENT", parentId);
            if (!item.children) {
              item.children = [];
            }
            item.children.push(newItem);
          }
          if (item.children) {
            item.children = addNewItem(item.children);
          }
          return item;
        });
      };
      const updatedItems = addNewItem(jsonitems);
      setExpanded([...expanded, parentId]);
      props.itemsChangedCallback(updatedItems, updatedDeletedList);
    }
  }
  function handleDeleteItem(lastClickedId: string) {
    console.log("Deleting ", lastClickedId);
    var deletedItemObject = null;
    const deleteItem = (items: AccordionItem[], parentId: string) => {
      return items.filter((item) => {
        if (item.id === lastClickedId) {
          deletedItemObject = { parentId: parentId, item: item };
          return false;
        }
        if (item.children) {
          item.children = deleteItem(item.children, item.id);
        }
        return true;
      });
    };
    deleteItem([...jsonitems], "");
    console.log(deletedItemObject);
    // setItems(updatedItems);
    props.itemsChangedCallback(
      jsonitems,
      deletedItemObject ? [deletedItemObject] : undefined
    );
  }

  const handleItemLabelChange = (id: string, label: string) => {
    const updateItems = (items: AccordionItem[]): AccordionItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, label };
        }
        if (item.children) {
          return { ...item, children: updateItems(item.children) };
        }
        return item;
      });
    };
    const newItems = updateItems(jsonitems);
    setItems(newItems);
    props.itemsChangedCallback(newItems);
  };
  const handleCheckChange = (id: string, checked: boolean) => {
    const updateItems = (items: AccordionItem[]): AccordionItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, checked: checked };
        }
        if (item.children) {
          return { ...item, children: updateItems(item.children) };
        }
        return item;
      });
    };
    const newItems = updateItems(jsonitems);
    setItems(newItems);
    props.itemsChangedCallback(newItems);
  };

  const handleUpdateDescription = (id: string, newDescription: string) => {
    const updateItems = (items: AccordionItem[]): AccordionItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, description: newDescription };
        }
        if (item.children) {
          return { ...item, children: updateItems(item.children) };
        }
        return item;
      });
    };
    const newItems = updateItems(jsonitems);
    setItems(newItems);
    props.itemsChangedCallback(newItems);
  };

  const handleAddDescription = (id: string) => {
    const updateItems = (items: AccordionItem[]): AccordionItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, description: " " };
        }
        if (item.children) {
          return { ...item, children: updateItems(item.children) };
        }
        return item;
      });
    };
    const newItems = updateItems(jsonitems);
    setItems(newItems);
    props.itemsChangedCallback(newItems);

    setDescription("");
    setDescriptionId(id);
    let linksfound: string[] = [];

    setLinks(linksfound);
    setShowDialog(true);
  };

  const handleMakeCritical = (id: string) => {
    const updateItems = (items: AccordionItem[]): AccordionItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, critical: !item.critical };
        }
        if (item.children) {
          return { ...item, children: updateItems(item.children) };
        }
        return item;
      });
    };
    const newItems = updateItems(jsonitems);
    setItems(newItems);
    props.itemsChangedCallback(newItems);
  };

  const handleSetTime = (id: string, time: string) => {
    console.log("handleSetTime", id, time);
    const updateItems = (items: AccordionItem[]): AccordionItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, time: time };
        }
        if (item.children) {
          return { ...item, children: updateItems(item.children) };
        }
        return item;
      });
    };
    const newItems = updateItems(jsonitems);
    console.log("=================", newItems);
    setItems(newItems);

    props.itemsChangedCallback(newItems);
  };

  function getTimeIcon(time: string) {
    if (time === "5 min") {
      return <Bolt color="success" />;
    } else if (time === "1 hour") {
      return <HourglassTop color="warning" />;
    } else {
      return <CalendarToday color="error" />;
    }
  }

  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");

  var doubleClickTimeout: NodeJS.Timeout | null = null;

  function recursiveItems(
    item: AccordionItem,
    depth: number,
    parentId: string
  ) {
    depth = depth + 1;

    const handleCheckboxChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      handleCheckChange(item.id, event.target.checked);
    };

    function titlewidget() {
      return editing === item.id ? (
        <ClickAwayListener
          onClickAway={() => {
            setEditing(null);
            handleItemLabelChange(item.id, newTitle);
          }}
        >
          <TextField
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            onFocus={(e) => e.target.select()}
            onBlur={() => {
              setEditing(null);
              handleItemLabelChange(item.id, newTitle);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                // Trigger submit logic here
                setEditing(null);
                handleItemLabelChange(item.id, newTitle);
                (event.target as HTMLInputElement).blur();
              }
            }}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
            }}
          />
        </ClickAwayListener>
      ) : (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            onDoubleClick={() => {
              setNewTitle(item.label);
              setEditing(item.id);
            }}
            onMouseDown={(event) => {
              let sortingtimout = setTimeout(() => {
                setSortingId(parentId);
              }, 500);

              const startTime = Date.now();
              const handleMouseUp = () => {
                const endTime = Date.now();
                const duration = endTime - startTime;
                if (duration < 500) {
                  clearTimeout(sortingtimout);
                  if (!editing) {
                    if (doubleClickTimeout) {
                      clearTimeout(doubleClickTimeout);
                      doubleClickTimeout = null;
                    } else {
                      const timeout = setTimeout(() => {
                        setExpanded(
                          expanded.includes(item.id)
                            ? expanded.filter((id) => id !== item.id)
                            : [...expanded, item.id]
                        );
                      }, 200); // adjust the timeout value as needed
                      doubleClickTimeout = timeout;
                    }
                  }
                }
              };
              document.addEventListener("mouseup", handleMouseUp, {
                once: true,
              });
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {depth === 1 ? <h2>{item.label}</h2> : <div>{item.label}</div>}
          </div>
        </div>
      );
    }
    const {
      checkedCount,
      totalChildren,
      uncheckedChildrenLabels,
      containsCritical,
    } = countCheckedAndTotalChildren(item.children);

    if (!item.children || item.children.length === 0) {
      return (
        <div
          key={item.id}
          style={{ display: "flex", alignItems: "center", width: "100%" }}
        >
          <div>
            <Checkbox
              checked={item.checked}
              onChange={handleCheckboxChange}
            ></Checkbox>
          </div>
          {item.critical && !item.checked && (
            <PriorityHigh style={{ color: "red" }} />
          )}
          {titlewidget()}
          {item.time && getTimeIcon(item.time)}
          <div>
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                handleOpenMenu(event, [
                  {
                    label: "Add New Sub Item",
                    onClick: () => {
                      handleAddNewSubItem(item.id);
                      handleCloseMenu();
                    },
                  },
                  {
                    label: "Delete Item",
                    onClick: () => {
                      handleDeleteItem(item.id);
                      handleCloseMenu();
                    },
                  },
                  {
                    label: "Add Description",
                    onClick: () => {
                      handleAddDescription(item.id);
                      handleCloseMenu();
                    },
                  },
                  {
                    label: "Toggle Critical",
                    onClick: () => {
                      handleMakeCritical(item.id);
                      handleCloseMenu();
                    },
                  },
                  {
                    label: "Estimate Time",
                    onClick: (event: any) => {
                      setSelectedItemId(item.id); // Set the selectedItemId to the current
                      console.log("selectedItemId", selectedItemId);
                      setEstimateTimeMenuAnchorEl(event.currentTarget);
                      setEstimateTimeMenuOpen(true);
                    },
                  },
                ]);
              }}
            >
              <MoreVert />
            </IconButton>
          </div>
          {item.description && (
            <div>
              <IconButton
                tabIndex={-1}
                onFocus={(event) => console.log("Button stole focus")}
                onClick={(e) => {
                  e.preventDefault();
                  setDescription(item.description!);
                  setDescriptionId(item.id);
                  let linksfound: string[] = [];
                  item.description?.split("\n").forEach((line) => {
                    if (line.trim().toLowerCase().startsWith("http")) {
                      linksfound.push(line.trim());
                    }
                  });
                  setLinks(linksfound);
                  setShowDialog(true);
                }}
              >
                <ChatBubble />
              </IconButton>
              {item.description.includes("http") &&
                item.description
                  .split("\n")
                  .filter((line) => line.trim().startsWith("http"))
                  .map((link) => {
                    return (
                      <IconButton onClick={() => window.open(link, "_blank")}>
                        <LinkOutlined />
                      </IconButton>
                    );
                  })}
            </div>
          )}
        </div>
      );
    }

    if (checkedCount > 0 && checkedCount == totalChildren) {
      item.checked = true;
    } else {
      item.checked = false;
    }
    return (
      <Accordion
        key={item.id}
        style={{
          borderLeft: `5px solid #ADD8E6`,
          boxSizing: "border-box",
        }}
        expanded={expanded.includes(item.id)}
      >
        <AccordionSummary
          onClick={(event) => {
            if (event.detail === 1) {
              event.stopPropagation();
              setExpanded(
                expanded.includes(item.id)
                  ? expanded.filter((id) => id !== item.id)
                  : [...expanded, item.id]
              );
            } else {
              event.stopPropagation();
            }
          }}
        >
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <div>{titlewidget()}</div>
            <Stack style={{ paddingLeft: "10px" }}>
              <LinearProgress
                style={{ width: "100px" }}
                variant="determinate"
                value={(checkedCount / totalChildren) * 100}
              />
              {!expanded.includes(item.id) && (
                <div>
                  {containsCritical && (
                    <PriorityHigh style={{ color: "red" }} />
                  )}
                  {uncheckedChildrenLabels &&
                    uncheckedChildrenLabels.length > 0 && (
                      <div>{uncheckedChildrenLabels[0]}</div>
                    )}
                </div>
              )}
            </Stack>
          </div>
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              handleOpenMenu(event, [
                {
                  label: "Flow Chart",
                  onClick: (event) => {
                    event.stopPropagation();

                    setFlowItem(item as object);
                    setShowFlow(true);
                  },
                },
                {
                  label: "Sort Children",
                  onClick: (event) => {
                    event.stopPropagation();

                    if (!expanded.includes(item.id)) {
                      setExpanded((previous) => {
                        return [...previous, item.id];
                      });
                    }
                    setSortingId(item.id);
                    handleCloseMenu();
                  },
                },

                {
                  label: "Delete Item",
                  onClick: () => {
                    handleDeleteItem(item.id);
                    handleCloseMenu();
                  },
                },
              ]);
            }}
          >
            <MoreVert />
          </IconButton>
         
        </AccordionSummary>
        <AccordionDetails draggable onDragOver={(e) => console.log(e)}>
          {item.id === sortingId ? (
            <ClickAwayListener onClickAway={() => setSortingId("")}>
              <div>
                <Sortable
                  data={{ items: item.children }}
                  itemsChangedCallback={(sortedItems: object[]) => {
                    console.log(sortedItems);
                    const updateItemChildren = (
                      items: AccordionItem[],
                      newChildren: AccordionItem[]
                    ): AccordionItem[] => {
                      return items.map((iterationItem) => {
                        if (iterationItem.id === item.id) {
                          return { ...iterationItem, children: newChildren };
                        } else if (iterationItem.children) {
                          return {
                            ...iterationItem,
                            children: updateItemChildren(
                              iterationItem.children,
                              newChildren
                            ),
                          };
                        }
                        return iterationItem;
                      });
                    };
                    const newItems = updateItemChildren(
                      jsonitems,
                      sortedItems as AccordionItem[]
                    );
                    setItems(newItems);
                    props.itemsChangedCallback(newItems);
                  }}
                />
              </div>
            </ClickAwayListener>
          ) : (
            item?.children &&
            item.children.map((child: AccordionItem) =>
              recursiveItems(child, depth, item.id)
            )
          )}
          <div>
            <Button onClick={() => handleAddNewSubItem(item.id)}>
              <Add />
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>
    );
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    options: any[]
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuOptions(options);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  function removeAllCompleteItems() {
    let removedItems: { item: AccordionItem; parentId: string }[] = [];
    const removeCheckedItems = (items: AccordionItem[], parentId: string) => {
      return items.filter((item) => {
        if (item.checked) {
          removedItems.push({ item: item, parentId: parentId });
          return false;
        }
        if (item.children) {
          item.children = removeCheckedItems(item.children, item.id);
        }
        return true;
      });
    };
    const newItems = removeCheckedItems(jsonitems, "");
    setItems(newItems);

    props.itemsChangedCallback(newItems, removedItems);
  }

  const [anchorElDeleted, setAnchorElDeleted] =
    React.useState<null | HTMLElement>(null);
  const handleClickRestore = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorElDeleted(event.currentTarget);
  };
  const handleCloseDeleted = () => {
    setAnchorElDeleted(null);
  };
  const [showDialog, setShowDialog] = React.useState(false);
  const [description, setDescription] = React.useState("");
  const [descriptionId, setDescriptionId] = React.useState("");
  const [links, setLinks] = React.useState<string[]>([]);

  const [showFlow, setShowFlow] = React.useState(false);
  const [flowitem, setFlowItem] = React.useState<object>();
  const [sortingId, setSortingId] = React.useState<string>("");
  const [estimateTimeMenuOpen, setEstimateTimeMenuOpen] = React.useState(false);
  const [estimateTimeMenuAnchorEl, setEstimateTimeMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = React.useState<string>("");

  return (
    <>
      <Menu
        open={estimateTimeMenuOpen}
        anchorEl={estimateTimeMenuAnchorEl}
        onClose={() => setEstimateTimeMenuOpen(false)}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <MenuItem
          onClick={() => {
            console.log(selectedItemId);
            handleSetTime(selectedItemId, "5 min");
          }}
        >
          5 min
        </MenuItem>
        <MenuItem onClick={() => handleSetTime(selectedItemId, "1 hour")}>
          An hour
        </MenuItem>
        <MenuItem
          onClick={() => handleSetTime(selectedItemId, "multiple days")}
        >
          Multiple Days
        </MenuItem>
      </Menu>
      <Dialog
        open={showFlow}
        onClose={() => setShowFlow(false)}
        maxWidth="lg"
        fullWidth
        sx={{
          padding: 2, // add some padding
        }}
      >
        <div style={{ width: "100%", height: "90vh" }}>
          <Flow data={flowitem!} />
        </div>
      </Dialog>
      <Dialog
        fullWidth
        maxWidth="lg"
        open={showDialog}
        onClose={() => {
          console.log("closing dialog");
          setShowDialog(false);
          handleUpdateDescription(descriptionId, description);
        }}
      >
        <DialogTitle>Description</DialogTitle>
        <DialogContent>
          <TextField
            maxRows={6}
            onFocus={(e) => {
              console.log("Focusing!!! ", document.activeElement);
              console.log("Event target: ", e.target);
              setTimeout(() => {
                e.target.focus();
              }, 0);
            }}
            onBlur={(e) => {
              console.log("Bluring!!! ", document.activeElement);
              console.log("Event target: ", e.target);
              console.log("Related target: ", e.relatedTarget);
              console.log("Current target: ", e.currentTarget);
            }}
            autoFocus
            fullWidth
            multiline
            value={description}
            onChange={(e) => {
              let linksfound: string[] = [];
              e.target.value.split("\n").forEach((line) => {
                if (line.trim().toLowerCase().startsWith("http")) {
                  linksfound.push(line.trim());
                }
              });
              setLinks(linksfound);
              setDescription(e.target.value);
            }}
          ></TextField>
        </DialogContent>
        <DialogActions>
          {links &&
            links.map((link, index) => (
              <IconButton onClick={() => window.open(link, "_blank")}>
                <LinkOutlined />{" "}
              </IconButton>
            ))}
          <IconButton
            onClick={() => {
              navigator.clipboard.readText().then((text) => {
                setDescription(description + "\n" + text);
              });
            }}
          >
            <ContentPasteOutlined />
          </IconButton>
        </DialogActions>
      </Dialog>
      <SpeedDial
        ariaLabel="SpeedDial basic example"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          key="Collapse"
          icon={<CloseFullscreen />}
          tooltipTitle="Collapse"
          onClick={() => setExpanded([])}
        />

        <SpeedDialAction
          key="restore"
          icon={<Restore />}
          tooltipTitle="Restore"
          onClick={(event) => handleClickRestore(event)}
        />
        <SpeedDialAction
          key="Done"
          icon={<Done />}
          tooltipTitle="Done"
          onClick={() => removeAllCompleteItems()}
        />
      </SpeedDial>
      <Menu
        id="simples-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {menuOptions.map((option, index) => (
          <MenuItem key={index} onClick={option.onClick}>
            {option.label}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        id="deleted-menu"
        anchorEl={anchorElDeleted}
        keepMounted
        open={Boolean(anchorElDeleted)}
        onClose={handleCloseDeleted}
      >
        {deleted &&
          deleted.map((deletedItem, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                let updatedDeletedList = props.passedItems.deleted;
                if (props.passedItems.deleted) {
                  updatedDeletedList = props.passedItems.deleted =
                    props.passedItems.deleted.filter(
                      (item) => item.item.id !== deletedItem.item.id
                    );
                }
                handleAddNewSubItem(
                  deletedItem.parentId,
                  deletedItem.item,
                  updatedDeletedList
                );
              }}
            >
              {deletedItem.item.label}
            </MenuItem>
          ))}
      </Menu>
      <div style={{ padding: "20px", width: "100%", boxSizing: "border-box" }}>
        {jsonitems.map((item: AccordionItem) =>
          recursiveItems(item, 0, "root")
        )}
      </div>
      <Button
        style={{ margin: "20px" }}
        variant="outlined"
        onClick={() => handleAddNewSubItem("")}
      >
        New Project <Add />
      </Button>
    </>
  );
}
