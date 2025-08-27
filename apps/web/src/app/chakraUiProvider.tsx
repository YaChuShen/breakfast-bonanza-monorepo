"use client";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";

import theme from "contents/theme";

const ChakraUiProvider = ({ children }: { children: React.ReactNode }) => {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
};

export default ChakraUiProvider;
