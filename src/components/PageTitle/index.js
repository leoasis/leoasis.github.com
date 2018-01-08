import React from "react";

export default function PageTitle({ children }) {
  return (
    <h1
      css={{
        margin: 0
      }}
    >
      {children}
    </h1>
  );
}
