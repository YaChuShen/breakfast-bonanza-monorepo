const onDragEnter = (
  targetItem,
  status,
  haveOverCook,
  list,
  setCookedGroup
) => {
  if (!status && !haveOverCook) {
    setCookedGroup(list.find((e) => e.init.value === targetItem));
  }
};

export default onDragEnter;
