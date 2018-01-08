import React from "react";
import DisqusComments from "react-disqus-comments";

export default function Comments({ siteUrl, pagePath }) {
  return (
    <DisqusComments
      shortname="leogcrespo"
      identifier={pagePath}
      url={`${siteUrl}${pagePath}`}
    />
  );
}
