import React from "react";
import PropTypes from "prop-types";
import Link from "gatsby-link";
import get from "lodash/get";
import Helmet from "react-helmet";

import { rhythm } from "../utils/typography";
import Sub from "../components/Sub";

class BlogIndex extends React.Component {
  render() {
    const siteTitle = get(this, "props.data.site.siteMetadata.title");
    const posts = get(this, "props.data.allMarkdownRemark.edges");

    return (
      <div>
        <Helmet title={get(this, "props.data.site.siteMetadata.title")} />
        {posts.map(post => {
          const title = get(post, "node.frontmatter.title");
          const date = new Date(get(post, "node.frontmatter.rawDate"));
          const path =
            [
              "/posts",
              date.getFullYear(),
              date.getMonth() + 1,
              date.getDate()
            ].join("/") + get(post, "node.frontmatter.path");

          return (
            <div
              key={path}
              css={{
                marginBottom: rhythm(3 / 2)
              }}
            >
              <h3
                css={{
                  marginBottom: rhythm(1 / 4)
                }}
              >
                <Link
                  css={{
                    fontWeight: 300,
                    textDecoration: "none"
                  }}
                  to={path}
                >
                  {post.node.frontmatter.title}
                </Link>
              </h3>
              <Sub>{post.node.frontmatter.date}</Sub>
              <p dangerouslySetInnerHTML={{ __html: post.node.excerpt }} />
            </div>
          );
        })}
      </div>
    );
  }
}

BlogIndex.propTypes = {
  route: PropTypes.object
};

export default BlogIndex;

export const pageQuery = graphql`
  query IndexQuery {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          frontmatter {
            title
            path
            date(formatString: "DD MMMM, YYYY")
            rawDate: date
          }
        }
      }
    }
  }
`;
