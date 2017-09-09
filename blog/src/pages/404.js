import React from "react";
import PropTypes from "prop-types";
import Link from "gatsby-link";
import get from "lodash/get";
import Helmet from "react-helmet";

import { rhythm } from "../utils/typography";

class NotFound extends React.Component {
  render() {
    return (
      <section class="content">
        <h1>Not Found</h1>

        <p>Sorry! Couldn't find that page. Bummer.</p>
      </section>
    );
  }
}


export default NotFound;
