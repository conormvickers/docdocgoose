import PBprovider from "./PBProvider/provider";
import Finance from "./Finance/Finance";
import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Tasks" />
          <Tab label="Finances" />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <PBprovider />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Finance />
      </CustomTabPanel>
    </>
  );
}

export default App;
