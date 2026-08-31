import { createTheme } from "@mui/material/styles";

const fontStack = [
  "Inter",
  "-apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Roboto",
  "Helvetica Neue",
  "Arial",
  "sans-serif",
].join(",");

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4F46E5",
      dark: "#4338CA",
      light: "#6366F1",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#64748B",
    },
    background: {
      default: "#F7F7FB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1E1B2E",
      secondary: "#64748B",
    },
    divider: "#E7E5F0",
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: fontStack,
    h4: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h6: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    body1: {
      lineHeight: 1.7,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: 0,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            "radial-gradient(circle at 15% 0%, rgba(99,102,241,0.06), transparent 45%), radial-gradient(circle at 85% 15%, rgba(139,92,246,0.05), transparent 40%)",
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 1px 2px rgba(30, 27, 46, 0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 22px",
          boxShadow: "none",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        },
        containedPrimary: {
          boxShadow: "0 1px 2px rgba(79, 70, 229, 0.25)",
          "&:hover": {
            boxShadow: "0 6px 16px rgba(79, 70, 229, 0.28)",
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          borderColor: "#E7E5F0",
          "&:hover": {
            borderColor: "#C7C2E0",
            backgroundColor: "rgba(79, 70, 229, 0.04)",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#FBFBFE",
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          "& fieldset": {
            borderColor: "#E7E5F0",
          },
          "&:hover fieldset": {
            borderColor: "#C7C2E0",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#4F46E5",
            borderWidth: 1.5,
          },
        },
        notchedOutline: {
          transition: "border-color 0.15s ease",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
