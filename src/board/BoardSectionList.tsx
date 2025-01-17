"use client";

fimport React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  closestCorners,
  defaultDropAnimation,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Pocketbase, { RecordModel } from "pocketbase";
import { BiDotsVertical, BiSolidTrash } from "react-icons/bi";
import { IoMdAdd } from "react-icons/io";
import { v4 as uuidv4 } from "uuid";

import {
  BoardSections,
  BoardSections as BoardSectionsType,
  Status,
  Task,
} from "./types";
import BoardSection from "./BoardSection";
import TaskItem from "./TaskItem";
import { Modal } from "@mui/material";

const getTasksByStatus = (tasks: Task[], status: Status) => {
  return tasks.filter((task) => task.status === status);
};

const getTaskById = (tasks: Task[], id: string) => {
  return tasks.find((task) => task.id === id);
};
const BOARD_SECTIONS = {
  Cooler: "Cooler",
  "Hot To Go": "Hot To Go",
  Done: "Done",
};
const BOARD_Colors = {
  Cooler: { from: "9fccfa", to: "0974f1" },
  "Hot To Go": { from: "f40752", to: "f9ab8f" },
  Done: { from: "82f4b1", to: "30c67c" },
};

export const initializeBoard = (tasks: Task[]) => {
  const boardSections: BoardSections = {};

  if (tasks) {
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].status in BOARD_SECTIONS) {
      } else {
        tasks[i].status = "Cooler";
      }
    }

    Object.keys(BOARD_SECTIONS).forEach((boardSectionKey) => {
      boardSections[boardSectionKey] = getTasksByStatus(
        tasks,
        boardSectionKey as Status
      );
    });
  }

  return boardSections;
};

export const findBoardSectionContainer = (
  boardSections: BoardSections,
  id: string
) => {
  if (id in boardSections) {
    return id;
  }

  const container = Object.keys(boardSections).find((key) =>
    boardSections[key].find((item) => item.id === id)
  );
  return container;
};

interface BoardSectionListProps {
  currentRecord: RecordModel;
  onTaskUpdate: (tasks: Task[]) => void;
}

export const BoardSectionList: React.FC<BoardSectionListProps> = ({
  currentRecord,
  onTaskUpdate,
}) => {
  const updateBoardSections = () => {
    const updatedBoardSections = { ...boardSections };

    Object.keys(updatedBoardSections).forEach((section) => {
      updatedBoardSections[section] = updatedBoardSections[section].map(
        (task) => {
          if (task.id === activeTaskId) {
            return { ...tempTask! };
          }
          return task;
        }
      );

      setBoardSections(updatedBoardSections);
    });
  };
  const getTaskJsonToSave = () => {
    var taskstosave: Task[] = [];
    Object.keys(boardSections).forEach((section) => {
      boardSections[section].forEach((task) => {
        task.status = section;
        taskstosave.push(task);
      });
    });

    return taskstosave;
  };

  const initialBoardSections = initializeBoard(currentRecord.data);
  const [boardSections, setBoardSections] =
    useState<BoardSectionsType>(initialBoardSections);
  useEffect(() => {
    onTaskUpdate(getTaskJsonToSave());
  }, [boardSections]);

  const [activeTaskId, setActiveTaskId] = useState<null | string>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveTaskId(active.id as string);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    // Find the containers
    const activeContainer = findBoardSectionContainer(
      boardSections,
      active.id as string
    );
    const overContainer = findBoardSectionContainer(
      boardSections,
      over?.id as string
    );

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setBoardSections((boardSection) => {
      const activeItems = boardSection[activeContainer];
      const overItems = boardSection[overContainer];

      // Find the indexes for the items
      const activeIndex = activeItems.findIndex(
        (item) => item.id === active.id
      );
      const overIndex = overItems.findIndex((item) => item.id !== over?.id);

      return {
        ...boardSection,
        [activeContainer]: [
          ...boardSection[activeContainer].filter(
            (item) => item.id !== active.id
          ),
        ],
        [overContainer]: [
          ...boardSection[overContainer].slice(0, overIndex),
          boardSections[activeContainer][activeIndex],
          ...boardSection[overContainer].slice(
            overIndex,
            boardSection[overContainer].length
          ),
        ],
      };
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const activeContainer = findBoardSectionContainer(
      boardSections,
      active.id as string
    );
    const overContainer = findBoardSectionContainer(
      boardSections,
      over?.id as string
    );

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = boardSections[activeContainer].findIndex(
      (task) => task.id === active.id
    );
    const overIndex = boardSections[overContainer].findIndex(
      (task) => task.id === over?.id
    );

    if (activeIndex !== overIndex) {
      setBoardSections((boardSection) => ({
        ...boardSection,
        [overContainer]: arrayMove(
          boardSection[overContainer],
          activeIndex,
          overIndex
        ),
      }));
    }

    setActiveTaskId(null);
  };

  const dropAnimation: DropAnimation = {
    ...defaultDropAnimation,
  };

  let dummyTask = activeTaskId
    ? getTaskById(getTaskJsonToSave(), activeTaskId)
    : null;

  const [isEditing, setIsEditing] = useState(false);
  const [tempTask, settempTask] = useState<Task | null>(null);

  const handleSave = () => {
    updateBoardSections();
    setIsEditing(false);
  };
  const deleteTask = (taskToDelete: Task, boardSection: string) => {
    setBoardSections((oldSections) => ({
      ...oldSections,
      [boardSection]: oldSections[boardSection].filter(
        (task) => task.id !== taskToDelete.id
      ),
    }));
    setIsEditing(false);
  };
  const deleteAllDoneTasks = () => {
    setBoardSections((oldSections) => ({
      ...oldSections,
      ["Done"]: [],
    }));
    setIsEditing(false);
  };

  const addNewTask = () => {
    const newTask = {
      id: uuidv4(),
      title: "new task",
      status: "todo",
      description: "",
    };
    setBoardSections((boardSection) => ({
      ...boardSection,
      "Hot To Go": [...boardSection["Hot To Go"], newTask],
    }));
    setActiveTaskId(newTask.id);
    setIsEditing(true);
    settempTask(newTask);
  };
  const inputRef = useRef<HTMLInputElement>(null);

  const [showReward, setShowReward] = useState(false);
  const [rewardValue, setRewardValue] = useState(0);
  const [currentReward, setCurrentReward] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const shouldScroll = useRef(false);

  async function showProgress() {
    shouldScroll.current = true;
    setShowReward(true);
  }
  const [subtaskEdit, setsubtaskEdit] = useState("");

  return (
    <>
      {/* <Modal
        opened={showReward}
        onClose={function (): void {
          shouldScroll.current = false;
          setShowReward(false);
        }}
      >
        <ProgressBar progressColor="blue" hideText score={rewardValue} />
        <Carousel
          slideSize="70%"
          height={200}
          draggable={false}
          withControls={false}
          getEmblaApi={setEmbla}
        >
          {boardSections['Done'].map((item) => (
            <Carousel.Slide key={item.id}>
              <Container style={{ height: '100%' }}>
                <Center style={{ height: '100%' }}>
                  <Title>{item.title}</Title>
                </Center>
              </Container>
            </Carousel.Slide>
          ))}
        </Carousel>
        <Group>
          <Button
            fullWidth
            size="xl"
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
            style={{ margin: '20px' }}
            onClick={() => {
              setShowReward(false);
              shouldScroll.current = false;
              deleteAllDoneTasks();
            }}
          >
            Acknowledge Progress
          </Button>
        </Group>
      </Modal>
      <Button
        style={{
          position: 'fixed',
          bottom: '60px', // adjust this value to your desired safe zone
          right: '16px', // adjust this value to your desired safe zone
          zIndex: 1, // ensure the button is on top of other elements
        }}
        variant="gradient"
        gradient={{ from: 'indigo', to: 'cyan' }}
        onClick={addNewTask}
        size="xl"
      >
        new task
      </Button>
      <Modal opened={isEditing} onClose={() => handleSave()}>
        <form
          onSubmit={(e) => {
            e.preventDefault();

            handleSave();
          }}
        >
          <TextInput
            key={'title'}
            ref={inputRef}
            label="Title"
            value={tempTask ? tempTask.title : ''}
            onChange={(e) => settempTask({ ...tempTask!, title: e.target.value })}
            data-autofocus
            onFocus={() => {
              if (inputRef.current) {
                inputRef.current.click();
                setTimeout(() => {
                  inputRef.current?.focus();
                  inputRef.current?.select();
                });
              }
            }}
          />

          <TextInput
            key={'description'}
            label="Details"
            value={tempTask ? tempTask.description : ''}
            onChange={(e) => settempTask({ ...tempTask!, description: e.target.value })}
          />
          {tempTask && tempTask.subtasks
            ? tempTask.subtasks.map((subtask, index) => (
                <Group
                  justify="space-between"
                  key={subtask.subtask + index + 'input'} // Add a unique key
                >
                  {editingIndex === index ? (
                    <TextInput
                      autoFocus
                      value={subtaskEdit}
                      onChange={(e) => {
                        setsubtaskEdit(e.target.value);
                      }}
                      onBlur={() => {
                        settempTask({
                          ...tempTask,
                          subtasks: tempTask.subtasks?.map((subtask, index) => {
                            if (index === editingIndex) {
                              return { ...subtask, subtask: subtaskEdit };
                            }
                            return subtask;
                          }),
                        });
                        setEditingIndex(null);
                      }}
                    ></TextInput>
                  ) : (
                    <Title
                      p={12}
                      size="sm"
                      c="dimmed"
                      onClick={() => {
                        setsubtaskEdit(subtask.subtask);
                        setEditingIndex(index);
                      }}
                      key={subtask.subtask + index + 'text'} // Add a unique key
                    >
                      {subtask.subtask}
                    </Title>
                  )}
                  <Group>
                    <Checkbox
                      key={subtask.subtask + index + 'checkbox'} // Add a unique key
                      checked={subtask.completed}
                      onChange={() => {
                        settempTask({
                          ...tempTask,
                          subtasks: tempTask.subtasks?.map((subtask, iterationindex) => {
                            if (index == iterationindex) {
                              return { ...subtask, completed: !subtask.completed };
                            }
                            return subtask;
                          }),
                        });
                      }}
                    />
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="dimmed">
                          <IconDots></IconDots>
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Label>Options</Menu.Label>
                        <Menu.Item
                          onClick={() =>
                            settempTask({
                              ...tempTask,
                              subtasks: tempTask.subtasks?.filter(
                                (subtask, iterationindex) => iterationindex !== index
                              ),
                            })
                          }
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>{' '}
                  </Group>
                </Group>
              ))
            : null}

          <Button
            fullWidth
            variant="outline"
            onClick={() => {
              if (!tempTask) return;
              settempTask({
                ...tempTask,
                subtasks: tempTask.subtasks
                  ? [...tempTask.subtasks, { subtask: 'subtask', completed: false }] // Add the id property and ensure it's a string
                  : [{ subtask: 'subtask', completed: false }], // Add the id property and ensure it's a string
              });
            }}
          >
            Add Subtask
          </Button>

          <Divider my="sm" />

          <Group>
            <Button type="submit" onClick={() => handleSave()}>
              Save
            </Button>
            <Button
              variant="outline"
              color="red"
              onClick={() => deleteTask(tempTask!, tempTask!.status)}
            >
              Delete
            </Button>
          </Group>
        </form>
      </Modal> */}
      <Container>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div
          // cols={{ base: 1, sm: 2, lg: 3 }}
          // spacing={{ base: 10, sm: "xl" }}
          // verticalSpacing={{ base: "md", sm: "xl" }}
          >
            {Object.keys(boardSections).map((boardSectionKey) => (
              <Grid item xs={4} key={boardSectionKey}>
                <BoardSection
                  id={boardSectionKey}
                  onClearSection={showProgress}
                  title={boardSectionKey}
                  tasks={boardSections[boardSectionKey]}
                  gradientColors={
                    BOARD_Colors[boardSectionKey as keyof typeof BOARD_Colors]
                  }
                  onTaskEdit={(recievedTasks: Task) => {
                    setActiveTaskId(recievedTasks.id);
                    setIsEditing(true);
                    settempTask(recievedTasks);
                  }}
                />
              </Grid>
            ))}
            <DragOverlay dropAnimation={dropAnimation}>
              {dummyTask ? (
                <TaskItem onTaskEdit={() => {}} task={dummyTask} />
              ) : null}
            </DragOverlay>
          </div>
        </DndContext>
      </Container>
    </>
  );
};

export default BoardSectionList;
