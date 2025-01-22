import PBprovider from "./PBProvider/provider";
import { Capacitor } from "@capacitor/core";
import "./App.css";

function App() {
  const isCapacitor = Capacitor.isNativePlatform();

  return (
    <div className="AppWrap">
      <div>
        {isCapacitor ? (
          <p>Running in Capacitor</p>
        ) : (
          <p>Running in Web Browser</p>
        )}
      </div>
      <PBprovider />
    </div>
  );
}

export default App;
