const Promise = require("bluebird")
const path = require("path")

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage, createRedirect } = boundActionCreators

  return new Promise((resolve, reject) => {
    const blogPost = path.resolve("./src/templates/blog-post.js")
    resolve(
      graphql(
        `
      {
        allMarkdownRemark(limit: 1000) {
          edges {
            node {
              frontmatter {
                path
                date
              }
            }
          }
        }
      }
    `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }

        // Create blog posts pages.
        result.data.allMarkdownRemark.edges.forEach(edge => {
          const date = new Date(edge.node.frontmatter.date);
          createPage({
            path: ['/posts', date.getFullYear(), date.getMonth() + 1, date.getDate()].join('/') + edge.node.frontmatter.path,
            component: blogPost,
            context: {
              path: edge.node.frontmatter.path,
            },
          })
        })
      })
    )
  })
}
