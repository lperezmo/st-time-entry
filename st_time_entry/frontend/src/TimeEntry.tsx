import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  StreamlitComponentBase,
  withStreamlitConnection,
  Streamlit,
  ComponentProps,
  Theme as STTheme,
} from "streamlit-component-lib";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { ThemeProvider, createTheme } from "@mui/material/styles";

interface State {
  value: Dayjs | null;
}

class TimeEntry extends StreamlitComponentBase<State> {
  public constructor(props: ComponentProps) {
    super(props);

    const defaultRaw = props.args["default"] as string | null | undefined;
    let dayjsValue: Dayjs | null = null;
    if (defaultRaw) {
      const try1 = dayjs(defaultRaw, "hh:mm a", true);
      dayjsValue = try1.isValid() ? try1 : dayjs(defaultRaw);
      if (!dayjsValue.isValid()) dayjsValue = null;
    }
    this.state = { value: dayjsValue };
  }

  /* ─────────────────────────────── */

  public render = (): React.ReactNode => {
    const stTheme: STTheme | undefined = this.props.theme;
    const disabled = this.props.disabled ?? false;
    const label = String(this.props.args["label"] ?? "Pick a time");

    /* Guaranteed strings ↓ */
    const paletteMode = stTheme?.base === "dark" ? "dark" : "light";
    const muiTheme = createTheme({
      palette: {
        mode: paletteMode,
        primary: { main: stTheme?.primaryColor ?? "#F63366" },
        background: {
          default:
            stTheme?.backgroundColor ??
            (paletteMode === "dark" ? "#0e1117" : "#FFFFFF"),
          paper:
            stTheme?.secondaryBackgroundColor ??
            (paletteMode === "dark" ? "#1e1e1e" : "#F0F2F6"),
        },
        text: {
          primary: stTheme?.textColor ?? (paletteMode === "dark" ? "#FAFAFA" : "#262730"),
        },
      },
      typography: { fontFamily: stTheme?.font ?? "Inter, system-ui, sans-serif" },
    });

    /* Card styling */
    const containerStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: "0.8rem",
      background:
        stTheme?.secondaryBackgroundColor ??
        "var(--secondary-background-color, #F0F2F6)",
      borderRadius: "0.75rem",
      boxShadow: "0 4px 14px rgba(0,0,0,0.07)",
      padding: "1.5rem",
      height: "400px",
      alignItems: "flex-start",
      fontFamily: stTheme?.font ?? "Inter, system-ui, sans-serif",
      minWidth: "220px",
      color: stTheme?.textColor ?? "var(--text-color, #262730)",
    };

    return (
      <ThemeProvider theme={muiTheme}>
        <div style={containerStyle}>
          <label style={{ fontWeight: 500 }}>{label}</label>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              value={this.state.value}
              onChange={this.handleChange}
              ampm
              slotProps={{
                textField: {
                  variant: "outlined",
                  size: "small",
                  disabled,
                  fullWidth: true,
                  placeholder: "hh:mm am/pm",
                },
                popper: {
                  container: window.document.body,
                  style: { zIndex: 999999, position: "fixed" },
                },
              }}
            />
          </LocalizationProvider>
        </div>
      </ThemeProvider>
    );
  };

  /* ─────────────────────────────── */

  private handleChange = (value: Dayjs | null) => {
    this.setState({ value }, () => {
      Streamlit.setComponentValue(value ? value.format("hh:mm a") : null);
    });
  };
}

export default withStreamlitConnection(TimeEntry);
