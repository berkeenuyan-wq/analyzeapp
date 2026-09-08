import { NavLink } from "react-router-dom";

import { tr } from "../../i18n/tr";
import { useTheme } from "../../lib/theme";
import {
  FlaskIcon,
  GaugeIcon,
  LayoutDashboardIcon,
  LineChartIcon,
  MoonIcon,
  SunIcon,
  TableIcon,
  TruckIcon,
} from "../icons";
import styles from "./IconRail.module.css";

interface RailItem {
  to: string;
  label: string;
  Icon: typeof LayoutDashboardIcon;
}

const ITEMS: readonly RailItem[] = [
  { to: "/", label: tr.nav.overview, Icon: LayoutDashboardIcon },
  { to: "/press", label: tr.nav.press, Icon: GaugeIcon },
  { to: "/lab", label: tr.nav.lab, Icon: FlaskIcon },
  { to: "/trucks", label: tr.nav.trucks, Icon: TruckIcon },
  { to: "/data", label: tr.nav.data, Icon: TableIcon },
  { to: "/charts", label: tr.nav.charts, Icon: LineChartIcon },
];

export function IconRail() {
  const { theme, toggle } = useTheme();
  const ThemeIcon = theme === "dark" ? SunIcon : MoonIcon;

  return (
    <nav className={styles.rail} aria-label={tr.app.name}>
      <div className={styles.brand} title={tr.app.name}>
        {tr.app.name.charAt(0)}
      </div>

      <ul className={styles.items}>
        {ITEMS.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.linkActive}` : styles.link
              }
              title={label}
            >
              <Icon />
              <span className={styles.srOnly}>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={styles.toggle}
        onClick={toggle}
        title={tr.nav.toggleTheme}
        aria-label={tr.nav.toggleTheme}
      >
        <ThemeIcon />
      </button>
    </nav>
  );
}
