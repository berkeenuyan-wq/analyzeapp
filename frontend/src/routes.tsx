import { createHashRouter } from "react-router-dom";

import { AppShell, RouteBoundary } from "./App";
import {
  ChartAnalysis,
  DataEntry,
  LabReports,
  Overview,
  PressAnalysis,
  TruckDelivery,
} from "./pages";

// Hash routing: the packaged renderer is loaded from `file://`, so there is no
// server to resolve deep paths.
export const router = createHashRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: (
          <RouteBoundary label="overview">
            <Overview />
          </RouteBoundary>
        ),
      },
      {
        path: "press",
        element: (
          <RouteBoundary label="press">
            <PressAnalysis />
          </RouteBoundary>
        ),
      },
      {
        path: "lab",
        element: (
          <RouteBoundary label="lab">
            <LabReports />
          </RouteBoundary>
        ),
      },
      {
        path: "trucks",
        element: (
          <RouteBoundary label="trucks">
            <TruckDelivery />
          </RouteBoundary>
        ),
      },
      {
        path: "data",
        element: (
          <RouteBoundary label="data">
            <DataEntry />
          </RouteBoundary>
        ),
      },
      {
        path: "charts",
        element: (
          <RouteBoundary label="charts">
            <ChartAnalysis />
          </RouteBoundary>
        ),
      },
    ],
  },
]);
