import { FC } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Dashboard } from "src/pages/dashboard";
import { Home } from "src/pages/home";

export const Router: FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/dashboard">
          <Dashboard />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};
