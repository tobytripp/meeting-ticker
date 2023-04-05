(ns meeting-ticker.views
  (:require
   [re-frame.core :as re-frame]
   [meeting-ticker.subs :as subs]

   [meeting-ticker.events :as events]))

(defn input [type label id]
  (let [value (re-frame/subscribe [::subs/form id])]
    [:label label
     [:input {:id id
              :type type
              :value @value
              :on-change #(re-frame/dispatch [::events/update-form id (-> % .-target .-value)])}]]))

(defn main-panel []
  (let [start (re-frame/subscribe [::subs/start-date])]
    [:form {:on-submit #()}
     [input "number" "Number of Attendees:"    :attendees]
     [input "number" "Average Hourly Rate:"    :rate]
     [input "time"   "The Meeting Started at:" :start-time]

     [:button.start
      {:on-click #(re-frame/dispatch [::events/start-ticker start])}
      "Start"]
     ]))
