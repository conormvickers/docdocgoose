import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  Divider,
  Grid,
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
import { costdefault } from "./breakdown";
import { useEffect, useState } from "react";

export default function CostView({ costs, setCosts }) {
  return (
    <Accordion>
      <AccordionSummary>
        <Typography>Costs</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "left",
              alignItems: "center",
            }}
          >
            <Typography>Office Size: {costs.sqft} sqft</Typography>
            <ButtonGroup variant="text">
              <Button
                onClick={() => {
                  setCosts({
                    ...costs,
                    sqft: costs.sqft - 500,
                  });
                }}
              >
                -
              </Button>
              <Button
                onClick={() => {
                  setCosts({
                    ...costs,
                    sqft: costs.sqft + 500,
                  });
                }}
              >
                +
              </Button>
            </ButtonGroup>
          </div>
          <IconButton onClick={() => setCosts(costdefault)}>reset</IconButton>
        </div>
        {Object.keys(costs)
          .filter((key) => key !== "sqft")
          .map((key) => (
            <Card key={key} sx={{ marginBottom: 2 }}>
              <CardHeader title={key} />
              <Grid container spacing={2} padding={2}>
                {Object.keys(costs[key]).map((key2) => (
                  <Grid item xs={12} sm={6} key={key2}>
                    <Typography variant="body1" component="div">
                      {key2.endsWith("*") ? key2.slice(0, -1) : key2}
                    </Typography>

                    <div style={{ display: "flex", alignItems: "center" }}>
                      {key2.endsWith("*") ? (
                        <Typography variant="body2" color="text.secondary">
                          {costs[key][key2].toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}{" "}
                          $ / sqft
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="red">
                          -
                          {costs[key][key2].toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </Typography>
                      )}
                      <ButtonGroup variant="text">
                        <Button
                          onClick={() => {
                            setCosts({
                              ...costs,
                              [key]: {
                                ...costs[key],
                                [key2]:
                                  costs[key][key2] -
                                  costdefault[key][key2] * 0.1,
                              },
                            });
                          }}
                        >
                          -
                        </Button>
                        <Button
                          onClick={() => {
                            setCosts({
                              ...costs,
                              [key]: {
                                ...costs[key],
                                [key2]:
                                  costs[key][key2] +
                                  costdefault[key][key2] * 0.1,
                              },
                            });
                          }}
                        >
                          +
                        </Button>
                      </ButtonGroup>
                    </div>
                    {key2.endsWith("*") && (
                      <Typography variant="subtitle2" color="text.secondary">
                        x {costs.sqft} sqft =
                      </Typography>
                    )}
                    {key2.endsWith("*") && (
                      <Divider
                        style={{
                          marginTop: 1,
                          marginBottom: 1,
                          maxWidth: "200px",
                        }}
                      />
                    )}
                    {key2.endsWith("*") && (
                      <Typography variant="body2" color="red">
                        -
                        {(costs[key][key2] * costs.sqft).toLocaleString(
                          "en-US",
                          {
                            style: "currency",
                            currency: "USD",
                          }
                        )}
                      </Typography>
                    )}
                  </Grid>
                ))}
              </Grid>
            </Card>
          ))}
      </AccordionDetails>
    </Accordion>
  );
}
