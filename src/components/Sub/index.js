import React from "react";
import { gray50 } from "../../utils/colors";
import { rhythm, scale, headerFontFamily } from "../../utils/typography";

export default function Sub({ children }) {
  return (
    <p
      css={{
        marginBottom: rhythm(1 / 2),
        fontFamily: headerFontFamily,
        ...scale(0.05),
        color: gray50
      }}
    >
      {children}
    </p>
  );
}
