import PBprovider from "./PBProvider/provider";
import "@ionic/react/css/core.css";
import { setupIonicReact } from "@ionic/react";
import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/react";

setupIonicReact();
function App() {
  return (
    <div>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Header</IonTitle>
        </IonToolbar>
      </IonHeader>
      <PBprovider />
    </div>
  );
}

export default App;
