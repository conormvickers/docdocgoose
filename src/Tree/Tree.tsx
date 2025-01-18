import * as React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckIcon from "@mui/icons-material/Check";

import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeViewBaseItem, TreeViewItemId } from "@mui/x-tree-view/models";
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
import { IconButton, styled } from "@mui/material";

export default function MyTreeView() {
  const apiRef = useTreeViewApiRef();

  const [selectedItems, setSelectedItems] = React.useState<string[]>([
    "charts",
  ]);

  const initialProducts: TreeViewBaseItem[] = [
    {
      id: "grid",
      label: "Data Grid",
      children: [
        { id: "grid-community", label: "@mui/x-data-grid" },
        { id: "grid-pro", label: "@mui/x-data-grid-pro" },
        { id: "grid-premium", label: "@mui/x-data-grid-premium" },
      ],
    },
    {
      id: "pickers",
      label: "Date and Time Pickers",
      children: [
        { id: "pickers-community", label: "@mui/x-date-pickers" },
        { id: "pickers-pro", label: "@mui/x-date-pickers-pro" },
      ],
    },
    {
      id: "charts",
      label: "Charts",
      children: [{ id: "charts-community", label: "@mui/x-charts" }],
    },
    {
      id: "tree-view",
      label: "Tree View",
      children: [{ id: "tree-view-community", label: "@mui/x-tree-view" }],
    },
  ];

  const [MUI_X_PRODUCTS, setItems] = React.useState(initialProducts);

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
    expandItem: (event: React.MouseEvent) => void;
  }

  function CustomLabel({
    editing,
    editable,
    children,
    toggleItemEditing,
    expandItem,
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
          justifyContent: "space-between",
        }}
      >
        {children}
        {
          <IconButton
            size="small"
            onClick={toggleItemEditing}
            sx={{ color: "text.secondary" }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        }
      </TreeItem2Label>
    );
  }

  interface CustomLabelInputProps extends UseTreeItem2LabelInputSlotOwnProps {
    handleCancelItemLabelEditing: (event: React.SyntheticEvent) => void;
    handleSaveItemLabel: (event: React.SyntheticEvent, label: string) => void;
    value: string;
  }

  function CustomLabelInput(props: Omit<CustomLabelInputProps, "ref">) {
    const {
      handleCancelItemLabelEditing,
      handleSaveItemLabel,
      value,
      ...other
    } = props;

    return (
      <React.Fragment>
        <TreeItem2LabelInput {...other} value={value} />
      </React.Fragment>
    );
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
    const childnum = childlist.filter(
      (id) => !selectedItems.includes(id)
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
            <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
              <TreeItem2Checkbox {...getCheckboxProps()} />
              {childnum}
              <Button
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  setItems((items) => {
                    const newItems = [...items];
                    newItems.push({
                      id: "tree-view-sdfwoeihf",
                      label: "@HERADGS",
                    });
                    return newItems;
                  });
                }}
              >
                +
              </Button>
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
                />
              )}
            </Box>
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
    event: React.SyntheticEvent,
    ids: string[]
  ) => {
    setSelectedItems(ids);
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
    const newItems = updateItems(MUI_X_PRODUCTS);
    setItems(newItems);
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ minHeight: 352, minWidth: 250 }}>
        <RichTreeView
          apiRef={apiRef}
          slots={{ item: CustomTreeItem }}
          items={MUI_X_PRODUCTS}
          selectedItems={selectedItems}
          onSelectedItemsChange={handleSelectedItemsChange}
          multiSelect
          checkboxSelection
          isItemEditable
          experimentalFeatures={{ labelEditing: true }}
          onItemLabelChange={(id, label) => {
            handleItemLabelChange(id, label);
          }}
        />
      </Box>
      {JSON.stringify(MUI_X_PRODUCTS)}
    </Stack>
  );
}
