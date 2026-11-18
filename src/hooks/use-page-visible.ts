import * as React from "react";

// False while the tab is in the background, so loops can pause
export function usePageVisible() {
  const [visible, setVisible] = React.useState(() => !document.hidden);

  React.useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  return visible;
}
