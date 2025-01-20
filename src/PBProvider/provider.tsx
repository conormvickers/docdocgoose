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

  async function updateData(data: any) {
    console.log("updateData", data);
    await pb.collection("tasks").update(recordid, data);
  }

  useEffect(() => {
    getData();
  }, []);

  return jsondata === null ? (
    <div>loading...</div>
  ) : (
    <div>
      <div style={{ padding: "20px", height: "100px" }}>hello </div>
      <div style={{ padding: "20px", position: "relative" }}>
        {/* <MyTreeView
          passedItems={jsondata.items}
          passedSelectedItems={jsondata.selected}
          itemsChangedCallback={(items, selected) => {
            console.log("got back", items, selected);
            updateData({ items: items, selected: selected });
          }}
        /> */}

        <MyAccordion
          passedItems={jsondata.items}
          itemsChangedCallback={(items) => {
            updateData({ items: items });
          }}
        />
      </div>
    </div>
  );
}
<div></div>;
