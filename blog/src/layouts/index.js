import React from "react";
import PropTypes from "prop-types";
import Link from "gatsby-link";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { rhythm } from "../utils/typography";

// Styles for code blocks
require("prismjs/themes/prism-okaidia.css");

class Template extends React.Component {
  render() {
    const { location, children } = this.props;
    const footerHeight = 50;
    return (
      <div
        css={{
          minHeight: "100%",
          position: "relative",
          paddingBottom: footerHeight
        }}
      >
        <Header />
        <main>
          <div
            css={{
              position: "relative",
              width: "800px",
              margin: "0 auto",
              padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
              "@media only screen and (max-width: 480px), only screen and (width: 768px)": {
                paddingTop: rhythm(1),
                width: "100%"
              }
            }}
          >
            {children()}
          </div>
        </main>
        <Footer height={footerHeight} />
      </div>
    );
  }
}

Template.propTypes = {
  children: PropTypes.func,
  location: PropTypes.object,
  route: PropTypes.object
};

export default Template;
