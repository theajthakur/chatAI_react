import { Notyf } from "notyf";
import "notyf/notyf.min.css";

export const notyf = new Notyf({
  duration: 3000,
  position: {
    x: "right",
    y: "top",
  },
  types: [
    {
      type: "success",
      background: "green",
      icon: false,
    },
    {
      type: "error",
      background: "red",
      icon: false,
    },
  ],
});
