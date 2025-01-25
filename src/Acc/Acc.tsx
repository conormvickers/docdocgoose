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
  Fab,
  LinearProgress,
} from "@mui/material";

import {
  Add,
  DeleteForever,
  Done,
  MoreVert,
  PriorityHigh,
  Refresh,
} from "@mui/icons-material";
import { useState } from "react";

type AccordionItem = {
  id: string;
  label: string;
  checked?: boolean;
  description?: string;
  critical?: boolean;
  children?: AccordionItem[];
};

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
        if (item.critical) {
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
      setItems(updatedItems);
      setExpanded([...expanded, parentId]);
      props.itemsChangedCallback(updatedItems, updatedDeletedList);
    }
  }
  function handleDeleteItem(lastClickedId: string) {
    if (lastClickedId) {
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
      const updatedItems = deleteItem(jsonitems, "");
      setItems(updatedItems);
      props.itemsChangedCallback(
        updatedItems,
        deletedItemObject ? [deletedItemObject] : undefined
      );
    }
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

  const handleAddDescription = (id: string) => {
    const updateItems = (items: AccordionItem[]): AccordionItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, description: "" };
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

  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");

  var doubleClickTimeout: NodeJS.Timeout | null = null;

  function recursiveItems(item: AccordionItem, depth: number) {
    depth = depth + 1;

    const handleCheckboxChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      handleCheckChange(item.id, event.target.checked);
    };

    if (!item.children || item.children.length === 0) {
      return (
        <div key={item.id} style={{ display: "flex", alignItems: "center" }}>
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
                    label: "Make Critical",
                    onClick: () => {
                      handleMakeCritical(item.id);
                      handleCloseMenu();
                    },
                  },
                ]);
              }}
            >
              <MoreVert />
            </IconButton>
          </div>
        </div>
      );
    }

    function titlewidget() {
      return editing === item.id ? (
        <ClickAwayListener onClickAway={() => setEditing(null)}>
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
            onClick={(event) => {
              event.stopPropagation();
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

    return (
      <Accordion
        key={item.id}
        style={{
          paddingLeft: "30px",
          borderLeft: `5px solid #ADD8E6`,
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
          <div>{titlewidget()}</div>
          <LinearProgress
            style={{ width: "100px" }}
            variant="determinate"
            value={(checkedCount / totalChildren) * 100}
          />
          {!expanded.includes(item.id) && (
            <div>
              {containsCritical && <PriorityHigh style={{ color: "red" }} />}
              {uncheckedChildrenLabels &&
                uncheckedChildrenLabels.length > 0 && (
                  <div>{uncheckedChildrenLabels[0]}</div>
                )}
            </div>
          )}
        </AccordionSummary>
        <AccordionDetails>
          {item?.children &&
            item.children.map((child: AccordionItem) =>
              recursiveItems(child, depth)
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
    const removeCheckedItems = (items: AccordionItem[]) => {
      return items.filter((item) => {
        if (item.checked) {
          removedItems.push({ item: item, parentId: "" });
          return false;
        }
        if (item.children) {
          item.children = removeCheckedItems(item.children);
        }
        return true;
      });
    };
    const newItems = removeCheckedItems(jsonitems);
    setItems(newItems);

    props.itemsChangedCallback(newItems, removedItems);
  }

  const [anchorElDeleted, setAnchorElDeleted] =
    React.useState<null | HTMLElement>(null);
  const handleClickDeleted = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElDeleted(event.currentTarget);
  };
  const handleCloseDeleted = () => {
    setAnchorElDeleted(null);
  };

  return (
    <>
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
      {jsonitems.map((item: AccordionItem) => recursiveItems(item, 0))}
      <Button
        style={{ margin: "20px" }}
        variant="outlined"
        onClick={() => handleAddNewSubItem("")}
      >
        New Project <Add />
      </Button>
      <Fab
        style={{ position: "fixed", bottom: "40px", right: "180px" }}
        onClick={(event) => handleClickDeleted(event)}
        color="primary"
        aria-label="add"
      >
        <DeleteForever />
      </Fab>
      <Fab
        style={{ position: "fixed", bottom: "40px", right: "20px" }}
        onClick={() => window.location.reload()}
        color="primary"
        aria-label="add"
      >
        <Refresh />
      </Fab>
      <Fab
        style={{ position: "fixed", bottom: "40px", right: "100px" }}
        onClick={() => removeAllCompleteItems()}
        color="primary"
        aria-label="add"
      >
        <Done />
      </Fab>
    </>
  );
}
