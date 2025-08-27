import { Text } from "@chakra-ui/react";
import React from "react";

const TimeText = ({ t }) => <Text as='span'>{String(t).padStart(2, "0")}</Text>;

function MyTimer({ seconds, minutes }) {
  return (
    <Text>
      <TimeText t={minutes} /> : <TimeText t={seconds} />
    </Text>
  );
}

const Timer = ({ seconds, minutes }) => {
  return <MyTimer seconds={seconds} minutes={minutes} />;
};

export default Timer;
