import { useEffect, useState } from "react";

import PocketBase from "pocketbase";
import MyAccordion from "../Acc/Acc";

const pb = new PocketBase("https://pocketbase.docdrive.link");
const recordid = "ouz5zjp86diz2lt";

export default function PBProvider() {
  const [jsondata, setData] = useState<any>(null);

  async function getData() {
    const record = await pb.collection("tasks").getOne(recordid);
    console.log(record);
    setData(record);
  }
  // Subscribe to changes only in the specified record
  pb.collection("tasks").subscribe(
    recordid,
    function (e) {
      console.log(e.action);
      console.log(e.record);
      if (e.action === "update") {
        setData(e.record);
      }
    },
    {}
  );

  const handleFocus = () => {
    console.log("getting data from focus");
    getData();
  };

  useEffect(() => {
    window.addEventListener("focus", handleFocus);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  async function updateData(data: any) {
    console.log("updateData", data);
    await pb.collection("tasks").update(recordid, data);
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      {jsondata === null ? (
        <div>loading...</div>
      ) : (
        <MyAccordion
          passedItems={jsondata}
          itemsChangedCallback={(items, deleted) => {
            const recordUpdateObject: { items: object; deleted?: object } = {
              items: items,
            };
            if (deleted) {
              console.log("deleted", deleted);
              if (jsondata.deleted) {
                recordUpdateObject.deleted = [
                  ...jsondata.deleted,
                  ...deleted,
                ].slice(-20);
              } else {
                recordUpdateObject.deleted = deleted;
              }
            }
            updateData(recordUpdateObject);
          }}
        />
      )}
    </>
  );
}
