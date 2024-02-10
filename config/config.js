const createConfig = (method, url, data) => {
  return {
    method: method,
    maxBodyLength: Infinity,
    url: url,
    headers: {
      "Content-Type": 'application/json',
    },
    data: data,
  };
};

module.exports = createConfig;
