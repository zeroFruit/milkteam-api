const responseByCode = (res, code, status = 200) => {
  res.status(status).json({code});
}

module.exports = {
  responseByCode
}
