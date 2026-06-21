export const echoRequest = async (req, res) => {
  try {
    return res.status(200).json({
      message: "debug info",
      cookies: req.cookies || {},
      headers: {
        origin: req.headers.origin,
        referer: req.headers.referer,
        host: req.headers.host,
        "user-agent": req.headers["user-agent"],
      },
      method: req.method,
      path: req.path,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
