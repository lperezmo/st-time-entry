import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import { StreamlitComponentBase, withStreamlitConnection, Streamlit, ComponentProps } from "streamlit-component-lib";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem",
  background: "#fff",
  borderRadius: "0.75rem",
  boxShadow: "0 4px 14px rgba(0,0,0,0.07)",
  padding: "1.5rem",
  height: "400px",
  alignItems: "flex-start",
  fontFamily: "Inter, system-ui, sans-serif",
  minWidth: "220px"
};

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
  public render = (): React.ReactNode => {
    const label = String(this.props.args["label"] ?? "Pick a time");
    const disabled = this.props.disabled ?? false;
    return (
      <div style={containerStyle}>
        <label style={{ fontWeight: 500, color: "#222" }}>{label}</label>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimePicker
            value={this.state.value}
            onChange={this.handleChange}
            ampm={true}
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
              style: { zIndex: 999999, position: "fixed" }
            }
              // popper: {
              //   container: window.document.body,
              //   style: { zIndex: 2147483647 }
              // }
            }}
          />
        </LocalizationProvider>
      </div>
    );
  };
  private handleChange = (value: Dayjs | null) => {
    this.setState({ value }, () => {
      Streamlit.setComponentValue(value ? value.format("hh:mm a") : null);
    });
  };
}

export default withStreamlitConnection(TimeEntry);