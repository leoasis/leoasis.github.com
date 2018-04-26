import React from "react";
import PropTypes from "prop-types";
import Link from "gatsby-link";
import get from "lodash/get";
import Helmet from "react-helmet";

import { rhythm } from "../utils/typography";
import * as colors from "../utils/colors";
import PageTitle from "../components/PageTitle";
import Sub from "../components/Sub";

class AboutPage extends React.Component {
  render() {
    const siteTitle = get(this, "props.data.site.siteMetadata.title");
    const siteAuthor = get(this, "props.data.site.siteMetadata.author");
    const posts = get(this, "props.data.allMarkdownRemark.edges");

    return (
      <div>
        <Helmet title={siteTitle} />
        <PageTitle>{siteAuthor}</PageTitle>
        <Sub>London, United Kingdom</Sub>

        <p>
          I'm a fan of technology who is always seeking for new stuff to learn,
          play with, or build real and cool stuff with. I'm currently
          experimenting and working on frontend code, with Javascript and mainly
          with React.
        </p>

        <p>
          Also a lover of music, bass guitar player and funny bad jokes teller.
        </p>

        <p>
          I'm currently working at{" "}
          <a href="http://twitter.com" target="_blank" rel="noopener">
            Twitter
          </a>, doing cool stuff with Javascript on{" "}
          <a href="http://tweetdeck.twitter.com" target="_blank" rel="noopener">
            TweetDeck
          </a>. I'm a lover of open source, you can check my contributions in{" "}
          <a href="http://github.com/leoasis" target="_blank" rel="noopener">
            my Github account
          </a>.
        </p>
        <p>
          You can contact me via{" "}
          <a
            target="_blank"
            href="http://twitter.com/leogcrespo"
            rel="noopener"
          >
            Twitter
          </a>{" "}
          to ask me a question, read some bad jokes (mostly in Spanish), or just
          to say hi. I would love to chat with you!
        </p>
      </div>
    );
  }
}

AboutPage.propTypes = {
  route: PropTypes.object
};

export default AboutPage;

export const pageQuery = graphql`
  query AboutQuery {
    site {
      siteMetadata {
        title
        author
      }
    }
  }
`;
