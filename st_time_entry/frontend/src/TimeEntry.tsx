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

const POPPER_OPEN_HEIGHT = 480;

class TimeEntry extends StreamlitComponentBase<State> {
  private readonly popperId: string;
  private readonly containerRef = React.createRef<HTMLDivElement>();
  private lastHeight: number = 0;
  private isPopperOpen: boolean = false;

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
    this.popperId = `time-entry-popper-${Math.random().toString(36).slice(2)}`;
  }

  public componentDidMount(): void {
    this.updateFrameHeight();
  }

  public componentDidUpdate(): void {
    // Don't resize while popper is open - let handleOpen control the height
    if (!this.isPopperOpen) {
      this.updateFrameHeight();
    }
  }

  public render = (): React.ReactNode => {
    const stTheme: STTheme | undefined = this.props.theme;
    const disabled = this.props.disabled ?? false;
    const label = String(this.props.args["label"] ?? "Pick a time");

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
      alignItems: "flex-start",
      fontFamily: stTheme?.font ?? "Inter, system-ui, sans-serif",
      minWidth: "220px",
      color: stTheme?.textColor ?? "var(--text-color, #262730)",
    };

    return (
      <ThemeProvider theme={muiTheme}>
        <div ref={this.containerRef} style={containerStyle}>
          <label style={{ fontWeight: 500 }}>{label}</label>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              value={this.state.value}
              onChange={this.handleChange}
              ampm
              onOpen={this.handleOpen}
              onClose={this.handleClose}
              slotProps={{
                textField: {
                  variant: "outlined",
                  size: "small",
                  disabled,
                  fullWidth: true,
                  placeholder: "hh:mm am/pm",
                },
                popper: {
                  disablePortal: true,
                  placement: "bottom-start",
                  style: { zIndex: 999999 },
                  className: this.popperId,
                  modifiers: [
                    {
                      name: "preventOverflow",
                      enabled: false,
                    },
                    {
                      name: "flip",
                      enabled: false,
                    },
                  ],
                },
              }}
            />
          </LocalizationProvider>
        </div>
      </ThemeProvider>
    );
  };

  private handleChange = (value: Dayjs | null) => {
    this.setState({ value }, () => {
      Streamlit.setComponentValue(value ? value.format("hh:mm a") : null);
    });
  };

  private handleOpen = () => {
    this.isPopperOpen = true;
    // Set expanded height immediately
    this.setFrameHeightSafe(POPPER_OPEN_HEIGHT);
    // Keep trying to set it as the popper renders
    window.setTimeout(() => {
      if (this.isPopperOpen) this.setFrameHeightSafe(POPPER_OPEN_HEIGHT);
    }, 50);
    window.setTimeout(() => {
      if (this.isPopperOpen) this.setFrameHeightSafe(POPPER_OPEN_HEIGHT);
    }, 150);
    window.setTimeout(() => {
      if (this.isPopperOpen) this.setFrameHeightSafe(POPPER_OPEN_HEIGHT);
    }, 300);
  };

  private handleClose = () => {
    this.isPopperOpen = false;
    this.updateFrameHeight();
  };

  private setFrameHeightSafe = (height: number) => {
    const finalHeight = Math.ceil(height);
    // Only update if significantly different OR if we're forcing it higher
    if (Math.abs(finalHeight - this.lastHeight) > 1 || finalHeight > this.lastHeight) {
      this.lastHeight = finalHeight;
      Streamlit.setFrameHeight(finalHeight);
    }
  };

  private updateFrameHeight = (includePopper = false) => {
    const containerHeight = this.containerRef.current?.getBoundingClientRect().height ?? 0;
    let targetHeight = containerHeight + 24;

    if (includePopper || this.isPopperOpen) {
      targetHeight = POPPER_OPEN_HEIGHT;
    }

    this.setFrameHeightSafe(targetHeight);
  };
}

export default withStreamlitConnection(TimeEntry);