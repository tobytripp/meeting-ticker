(ns meeting-ticker.odometer.views
  (:require
   [re-frame.core :as re-frame]))

(defn value-class [digit]
  (str "value-"
       (case digit
         "." "dot"
         "," "comma"
         "$" "dollar"
         digit)))

(defn column [index value]
  [:ul.odometer-column {:class (value-class value) :style {:left (str (* 128 index) "px")}}
   [:li "9"]
   [:li "8"]
   [:li "7"]
   [:li "6"]
   [:li "5"]
   [:li "4"]
   [:li "3"]
   [:li "2"]
   [:li "1"]
   [:li "0"]
   [:li ","]
   [:li "."]
   [:li "$"]])


(defn odometer [value]
  (vec
   (concat
    [:div.odometer]
    (map-indexed (fn [i n] [column i n]) (seq value)))))
