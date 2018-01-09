import Typography from "typography";
import "typeface-yanone-kaffeesatz";

import { strongOrange } from "./colors";

const typography = new Typography({
  baseFontSize: "18px",
  baseLineHeight: 1.45,
  headerFontFamily: ["Yanone Kaffeesatz", "Helvetica", "sans-serif"],
  headerWeight: 400,
  bodyFontFamily: ["Palatino Linotype", "Book Antiqua", "Palatino", "serif"],
  overrideStyles: ({ adjustFontSizeTo, scale, rhythm }, options) => {
    const styles = {
      a: {
        color: strongOrange
      },
      body: {
        MozFontFeatureSettings: "normal",
        msFontFeatureSettings: "normal",
        WebkitFontFeatureSettings: "normal",
        fontFeatureSettings: "normal"
      }
    };
    return styles;
  }
});

// Hot reload typography in development.
if (process.env.NODE_ENV !== "production") {
  typography.injectStyles();
}
typography.headerFontFamily = '"Yanone Kaffeesatz", "Helvetica", sans-serif';
export default typography;
