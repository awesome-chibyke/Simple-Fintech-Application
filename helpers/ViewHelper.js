const DetailsforView = (
  status = true,
  message = "",
  data = {},
  response_type = ""
) => {
  return {
    status: status,
    message: message,
    data: data,
    response_type: response_type,
  };
};

module.exports = DetailsforView;
