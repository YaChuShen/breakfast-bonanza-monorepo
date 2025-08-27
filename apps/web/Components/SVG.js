import React from "react";
import PropTypes from "prop-types";
import { Box, forwardRef } from "@chakra-ui/react";

const SVG = forwardRef(({ viewBox, children, ...props }, ref) => {
  return (
    <Box
      as='svg'
      xmlns='http://www.w3.org/2000/svg'
      viewBox={viewBox}
      ref={ref}
      {...props}>
      {children}
    </Box>
  );
});

SVG.propTypes = {
  viewBox: PropTypes.string,
  children: PropTypes.node.isRequired,
};

SVG.defaultProps = {
  display: "inline-block",
};

SVG.displayName = "SVG";

export default SVG;
