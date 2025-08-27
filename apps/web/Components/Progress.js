import React, { useEffect, useRef, useState } from "react";
import { CircularProgress } from "@chakra-ui/react";

const progressColor = ["green.400", "orange.400"];

const Progress = ({ time, ...props }) => {
  const [value, setValue] = useState(0);
  const [color, setColor] = useState(0);

  useEffect(() => {
    if (value === 100) {
      setColor(1);
    }
    const t = setTimeout(() => {
      if (value < 100) {
        setValue((prev) => prev + 5);
      }
      return () => clearTimeout(t);
    }, time);
  }, [value]);

  return (
    <CircularProgress
      {...props}
      value={value}
      color={progressColor[color]}
      thickness='12px'
    />
  );
};

export default Progress;
