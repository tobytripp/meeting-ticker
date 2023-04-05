(ns meeting-ticker.views
  (:require
   [re-frame.core :as re-frame]
   [goog.i18n.NumberFormat]
   [meeting-ticker.subs :as subs]

   [meeting-ticker.events :as events]))

(defn input [type label id]
  (let [value (re-frame/subscribe [::subs/form id])]
    [:label label
     [:input {:id id
              :type type
              :value @value
              :on-change #(re-frame/dispatch [::events/update-form id (-> % .-target .-value)])}]]))

(defn form []
  (let [start (re-frame/subscribe [::subs/start-date])]
    [:<>
     [input "number" "Number of Attendees:"    :attendees]
     [input "number" "Average Hourly Rate:"    :rate]
     [input "time"   "The Meeting Started at:" :start-time]

     [:button.start
      {:on-click #(re-frame/dispatch [::events/start-ticker start])}
      "Start"]
     ]))

(defn ticker []
  (let [cost (re-frame/subscribe [::subs/cost])
        fmt  (goog.i18n.NumberFormat. goog.i18n.NumberFormat.Format.CURRENCY)]
    [:h1 (.format fmt @cost)]))

(defn main-panel []
  (let [started-at (re-frame/subscribe [::subs/started-at])]
    (if @started-at
      [ticker]
      [form])))
