import { tr } from "../i18n/tr";
import { PagePlaceholder } from "./PagePlaceholder";

export { Overview } from "./Overview/Overview";

export const PressAnalysis = () => <PagePlaceholder title={tr.nav.press} />;
export const LabReports = () => <PagePlaceholder title={tr.nav.lab} />;
export const TruckDelivery = () => <PagePlaceholder title={tr.nav.trucks} />;
export const DataEntry = () => <PagePlaceholder title={tr.nav.data} />;
export const ChartAnalysis = () => <PagePlaceholder title={tr.nav.charts} />;
