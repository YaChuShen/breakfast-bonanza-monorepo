const postMethod = async ({ path, data }) => {
  await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export default postMethod;
