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
} from "@mui/material";
import {
  Add,
  Done,
  MoreVert,
  Refresh,
} from "@mui/icons-material";
import {  useState } from "react";

type AccordionItem = {
  id: string;
  label: string;
  checked?: boolean;
  children?: AccordionItem[];
};

interface MyAccordionProps {
  passedItems: object[];
  itemsChangedCallback: (items: object) => void;
}
export default function MyAccordion(props: MyAccordionProps) {
  const [jsonitems, setItems] = React.useState(
    props.passedItems as AccordionItem[]
  );

  const [menuOptions, setMenuOptions] = useState<any[]>([]);

  // function getItemDescendantsIds(item: AccordionItem) {
  //   const ids: string[] = [];
  //   item.children?.forEach((child) => {
  //     ids.push(child.id);
  //     ids.push(...getItemDescendantsIds(child));
  //   });

  //   return ids;
  // }

  function handleAddNewSubItem(lastClickedId: string) {
    const parentId = lastClickedId;
    const newItem: AccordionItem = {
      id: uuidv4(),
      label: "New Item",
      checked: false,
    };
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
    console.log(updatedItems);
    setItems(updatedItems);
  }
  function handleDeleteItem(lastClickedId: string) {
    console.log("handleDeleteItem", lastClickedId);
    if (lastClickedId) {
      const deleteItem = (items: AccordionItem[]) => {
        return items.filter((item) => {
          if (item.id === lastClickedId) {
            return false;
          }
          if (item.children) {
            item.children = deleteItem(item.children);
          }
          return true;
        });
      };
      const updatedItems = deleteItem(jsonitems);
      console.log(updatedItems);
      setItems(updatedItems);
      props.itemsChangedCallback(updatedItems);
    }
  }

  const handleItemLabelChange = (id: string, label: string) => {
    console.log("handleItemLabelChange", id, label);
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
    console.log("check changed for", id, checked);
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
          {titlewidget()}
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
              console.log("clicked title ", editing, doubleClickTimeout);
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
            {item?.label}
          </div>
          {!item.children && (
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
                  ]);
                }}
              >
                <MoreVert />
              </IconButton>
            </div>
          )}
        </div>
      );
    }

    return (
      <Accordion
        key={item.id}
        style={{ paddingLeft: "30px" }}
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
              console.log("key detected");
              event.stopPropagation();
            }
          }}
        >
          {titlewidget()}
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
    const removeCheckedItems = (items: AccordionItem[]) => {
      return items.filter((item) => {
        if (item.checked) {
          return false;
        }
        if (item.children) {
          item.children = removeCheckedItems(item.children);
        }
        return true;
      });
    };
    const newItems = removeCheckedItems(jsonitems);
    console.log(newItems);
    setItems(newItems);
    props.itemsChangedCallback(newItems);
  }

  return (
    <>
      <Menu
        id="simple-menu"
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
      {jsonitems.map((item: AccordionItem) => recursiveItems(item, 0))}
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
