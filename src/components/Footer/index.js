import React from "react";
import { gray10, strongOrange } from "../../utils/colors";

export default function Footer({ height }) {
  return (
    <footer
      css={{
        borderTop: `1px solid ${gray10}`,
        position: "absolute",
        bottom: 0,
        height,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <span>
        Made with ❤️ by{" "}
        <a
          css={{ color: strongOrange }}
          href="https://twitter.com/leogcrespo"
          target="_blank"
          rel="noopener"
        >
          Lenny
        </a>
      </span>
    </footer>
  );
}
