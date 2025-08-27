const onDrop = (targetItem, cookedGroup, status, setStatus) => {
  const isMaterial = targetItem === cookedGroup?.init.value;
  //是不是食物原物料進來
  if (isMaterial && !status) {
    setStatus('cooking');
  }
};

export default onDrop;
