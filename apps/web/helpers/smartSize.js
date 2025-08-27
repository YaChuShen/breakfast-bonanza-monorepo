const smartSize = (base, lg, isLevel2) => {
  return { base: isLevel2 ? base : lg, lg };
};

export default smartSize;
