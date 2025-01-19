import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { v4 as uuidv4 } from "uuid";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeViewBaseItem } from "@mui/x-tree-view/models";
import {
  TreeItem2Checkbox,
  TreeItem2Content,
  TreeItem2DragAndDropOverlay,
  TreeItem2GroupTransition,
  TreeItem2Icon,
  TreeItem2IconContainer,
  TreeItem2Label,
  TreeItem2LabelInput,
  TreeItem2Provider,
  TreeItem2Root,
  UseTreeItem2LabelInputSlotOwnProps,
  UseTreeItem2LabelSlotOwnProps,
  UseTreeItem2Parameters,
  useTreeItem2,
  useTreeItem2Utils,
  useTreeViewApiRef,
} from "@mui/x-tree-view";
import { IconButton, LinearProgress, styled } from "@mui/material";
import { Add } from "@mui/icons-material";

interface MyTreeViewProps {
  passedItems: TreeViewBaseItem[];
  passedSelectedItems: string[];
  itemsChangedCallback: (items: object, selectedItems: string[]) => void;
}
export default function MyTreeView(props: MyTreeViewProps) {
  const apiRef = useTreeViewApiRef();

  const [selectedItems, setSelectedItems] = React.useState<string[]>(
    props.passedSelectedItems
  );

  const [jsonitems, setItems] = React.useState(props.passedItems);

  function getItemDescendantsIds(item: TreeViewBaseItem) {
    const ids: string[] = [];
    item.children?.forEach((child) => {
      ids.push(child.id);
      ids.push(...getItemDescendantsIds(child));
    });

    return ids;
  }

  interface CustomLabelProps extends UseTreeItem2LabelSlotOwnProps {
    editable: boolean;
    editing: boolean;
    toggleItemEditing: () => void;
    addSubItem: () => void;
    expandItem: (event: React.MouseEvent) => void;
  }

  function CustomLabel({
    editing,
    editable,
    children,
    toggleItemEditing,
    expandItem,
    addSubItem,
    ...other
  }: CustomLabelProps) {
    return (
      <TreeItem2Label
        {...other}
        editable={editable}
        onClick={(event) => {
          event.stopPropagation();
          expandItem(event);
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          justifyContent: "start",
        }}
      >
        {children}
        {
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              toggleItemEditing();
            }}
            sx={{ color: "text.secondary" }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        }
        {
          <IconButton
            size="small"
            onClick={(event) => {
              console.log("trying to add here");
              event.stopPropagation();
              addSubItem();
            }}
            sx={{ color: "text.secondary" }}
          >
            <Add />
          </IconButton>
        }
      </TreeItem2Label>
    );
  }

  interface CustomLabelInputProps extends UseTreeItem2LabelInputSlotOwnProps {
    value: string;
  }

  function CustomLabelInput(props: Omit<CustomLabelInputProps, "ref">) {
    const { value, ...other } = props;

    return (
      <React.Fragment>
        <TreeItem2LabelInput {...other} value={value} />
      </React.Fragment>
    );
  }

  function handleAddNewSubItem(parentId: string, newItem: TreeViewBaseItem) {
    const addNewItem = (items: TreeViewBaseItem[]) => {
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

  const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
    padding: theme.spacing(0.5, 1),
  }));

  interface CustomTreeItemProps
    extends Omit<UseTreeItem2Parameters, "rootRef">,
      Omit<React.HTMLAttributes<HTMLLIElement>, "onFocus"> {}

  const CustomTreeItem = React.forwardRef(function CustomTreeItem(
    props: CustomTreeItemProps,
    ref: React.Ref<HTMLLIElement>
  ) {
    const { id, itemId, label, disabled, children, ...other } = props;

    const {
      getRootProps,
      getContentProps,
      getIconContainerProps,
      getCheckboxProps,
      getLabelProps,
      getLabelInputProps,
      getGroupTransitionProps,
      getDragAndDropOverlayProps,
      status,
    } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });
    const item = apiRef.current!.getItem(itemId);
    const childlist = getItemDescendantsIds(item);
    const childnum = childlist.filter((id) =>
      selectedItems.includes(id)
    ).length;

    const { interactions } = useTreeItem2Utils({
      itemId: props.itemId,
      children: props.children,
    });

    return (
      <TreeItem2Provider itemId={itemId}>
        <TreeItem2Root {...getRootProps(other)}>
          <CustomTreeItemContent {...getContentProps()}>
            <TreeItem2IconContainer {...getIconContainerProps()}>
              <TreeItem2Icon status={status} />
            </TreeItem2IconContainer>
            <Stack>
              {childlist.length > 0 && (
                <LinearProgress
                  variant="determinate"
                  value={(childnum / childlist.length) * 100}
                />
              )}
              <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
                <TreeItem2Checkbox
                  {...getCheckboxProps()}
                  visible={childlist.length > 0 ? false : true}
                />

                {status.editing ? (
                  <CustomLabelInput {...getLabelInputProps()} />
                ) : (
                  <CustomLabel
                    {...getLabelProps()}
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                    }}
                    expandItem={interactions.handleExpansion}
                    toggleItemEditing={interactions.toggleItemEditing}
                    addSubItem={() => {
                      console.log("adding request for", itemId);
                      handleAddNewSubItem(itemId, {
                        id: uuidv4(),
                        label: "New Item",
                      });
                    }}
                  />
                )}
              </Box>
            </Stack>
            <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} />
          </CustomTreeItemContent>
          {children && (
            <TreeItem2GroupTransition {...getGroupTransitionProps()} />
          )}
        </TreeItem2Root>
      </TreeItem2Provider>
    );
  });

  const handleSelectedItemsChange = (
    _event: React.SyntheticEvent,
    ids: string[]
  ) => {
    setSelectedItems(ids);
    props.itemsChangedCallback(jsonitems, ids);
  };
  const handleItemLabelChange = (id: string, label: string) => {
    console.log("handleItemLabelChange", id, label);
    const updateItems = (items: TreeViewBaseItem[]): TreeViewBaseItem[] => {
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
    props.itemsChangedCallback(newItems, selectedItems);
  };

  return (
    <RichTreeView
      apiRef={apiRef}
      slots={{ item: CustomTreeItem }}
      items={jsonitems}
      selectedItems={selectedItems}
      onSelectedItemsChange={handleSelectedItemsChange}
      multiSelect
      checkboxSelection
      isItemEditable
      expansionTrigger="content"
      experimentalFeatures={{ labelEditing: true }}
      onItemLabelChange={(id, label) => {
        handleItemLabelChange(id, label);
      }}
    />
  );
}
