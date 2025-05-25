import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  IconButton,
  LinearProgress,
  Paper,
  Select,
  Skeleton,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import PocketBase, { RecordModel } from "pocketbase";

import { costdefault, income } from "./breakdown";

import OverviewGraph from "./OverViewGraph";
import CostView from "./Costs";
import BalanceGraph from "./Balances";
import TransactionGraph from "./Transactions";
import DoughnutGraph from "./Doughnut";
import { time } from "echarts";

export default function Finance() {
  const pb = new PocketBase("https://pocketbase.docdrive.link");

  const [balanceData, setBalanceData] = useState<RecordModel[]>([]);
  const [transactionData, setTransactionData] = useState<RecordModel[]>([]);
  const [transactionsUpdated, setTransactionsUpdated] = useState<string>("");

  const [costs, setCosts] = useState(costdefault);
  const [timeframe, setTimeframe] = useState(24);
  const [lastupdated, setLastUpdated] = useState<string>("");

  async function updateData() {
    const records = await pb.collection("balances").getFullList({});

    setBalanceData(records);

    const tdata = await pb.collection("transactions").getFullList({
      sort: "-updated",
    });

    setTransactionData(tdata);

    setLastUpdated(records[0].updated);
    setTransactionsUpdated(tdata[0].updated);
  }

  useEffect(() => {
    updateData();
  }, []);

  function timeAgo(date: number) {
    const now = Date.now();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (years > 0) {
      return `${years} year${years === 1 ? "" : "s"} ago`;
    } else if (months > 0) {
      return `${months} month${months === 1 ? "" : "s"} ago`;
    } else if (days > 0) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    } else {
      return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
    }
  } // Example usage:const date = new Date('2022-01-01T00:00:00Z');console.log(timeAgo(date))
  return (
    <div>
      <h2>Overview</h2>
      <OverviewGraph timeframe={timeframe} income={income} costs={costs} />
      <h2>Last Update: {timeAgo(Date.parse(lastupdated))}</h2>
      <BalanceGraph record={balanceData} />
      <h2>Last Update: {timeAgo(Date.parse(transactionsUpdated))}</h2>
      <TransactionGraph record={transactionData} />
      <DoughnutGraph record={transactionData} />

      <CostView costs={costs} setCosts={setCosts} />
    </div>
  );
}
