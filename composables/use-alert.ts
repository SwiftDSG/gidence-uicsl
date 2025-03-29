import type { Alert } from "~~/types/alert";

type ErrorKind = "INVALID_URL";

export default () => {
  const alert = useState<Alert | null>("alert", () => null);

  const setError = (e: any): void => {
    if (e && e.message && typeof e.message === "string") {
      const kind: ErrorKind = e.message;
      let title = "";
      let message = "";
      switch (kind) {
        case "INVALID_URL":
          title = "URL Salah";
          message = "Pastikan URL yang digunakan benar";
          break;
        default:
          title = kind;
          message = "Silahkan mencoba lagi dalam beberapa saat";
          break;
      }

      setAlert({
        type: "error",
        title,
        message,
      });
    } else {
      setAlert({
        type: "error",
        title: "Unknown error occured",
        message: "Please try again later",
      });
    }
  };
  const setAlert = (data: Alert): void => {
    alert.value = data;
  };

  const removeAlert = (): void => {
    alert.value = null;
  };

  return { alert, setError, setAlert, removeAlert };
};
