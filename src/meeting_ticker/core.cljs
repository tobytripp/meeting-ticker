(ns meeting-ticker.core
  (:require
   [reagent.dom :as rdom]
   [re-frame.core :as re-frame]
   [meeting-ticker.events :as events]
   [meeting-ticker.views :as views]
   [meeting-ticker.config :as config]
   ))


(defn dev-setup []
  (when config/debug?
    (println "dev mode")))

(defn ^:dev/after-load mount-root []
  (re-frame/clear-subscription-cache!)
  (let [root-el (.getElementById js/document "app")]
    (rdom/unmount-component-at-node root-el)
    (rdom/render [views/main-panel] root-el)))

(defn dispatch-timer-event []
  (let [now (js/Date.)]
    (re-frame/dispatch [::events/timer now])))

(defonce do-timer (js/setInterval dispatch-timer-event 1000))

(defn init []
  (re-frame/dispatch-sync [::events/initialize-db])
  (dev-setup)
  (mount-root))
