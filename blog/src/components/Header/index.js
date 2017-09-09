import React from "react";
import Link from "gatsby-link";

import { gray10 } from "../../utils/colors";
import { rhythm } from "../../utils/typography";
import avatar from "./avatar.jpeg";

const styles = {
  ul: {
    margin: `0 ${rhythm(3 / 4)}`,
    lineHeight: "2",
    display: "flex",
    alignItems: "center"
  },
  li: {
    listStyle: "none",
    margin: "0 0.3em"
  },
  link: {
    color: "inherit",
    fontSize: "1.2em",
    textDecoration: "none",

    ":hover": {
      opacity: "0.4",
      color: "inherit"
    }
  }
};

export default class Header extends React.Component {
  render() {
    return (
      <header
        css={{
          borderBottom: `1px solid ${gray10}`,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
          fontWeight: 200
        }}
      >
        <nav>
          <ul css={styles.ul}>
            <li css={styles.li}>
              <Link css={styles.link} to="/">
                <img
                  src={avatar}
                  height="25"
                  width="25"
                  css={{
                    border: "0",
                    padding: "0",
                    borderRadius: 25,
                    display: "block"
                  }}
                />
              </Link>
            </li>
            <li css={styles.li}>
              <Link css={styles.link} to="/">
                Posts
              </Link>
            </li>
            <li css={styles.li}>
              <Link css={styles.link} to="/about">
                About
              </Link>
            </li>
            <li css={styles.li}>
              <a
                css={styles.link}
                href="https://github.com/leoasis"
                target="_blank"
                rel="noopener"
              >
                Github
              </a>
            </li>
            <li css={styles.li}>
              <a
                css={styles.link}
                href="https://twitter.com/leogcrespo"
                target="_blank"
                rel="noopener"
              >
                Twitter
              </a>
            </li>
          </ul>
        </nav>
      </header>
    );
  }
}
