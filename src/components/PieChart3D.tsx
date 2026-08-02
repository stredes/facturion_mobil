import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { PolarChart, Pie } from "victory-native";

type SliceData = {
  name: string;
  value: number;
  color: string;
} & Record<string, unknown>;

interface PieChart3DProps {
  data: SliceData[];
  size?: number;
  innerRadius?: number;
  depth?: number;
  startAngle?: number;
  endAngle?: number;
}

export const PieChart3D: React.FC<PieChart3DProps> = ({
  data,
  size = 300,
  innerRadius = 80,
  depth = 8,
  startAngle = -65,
  endAngle = 295,
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const circleSweepDegrees = endAngle - startAngle;

  const shadowData = data.map((d) => ({
    name: d.name,
    value: d.value,
    color: shadeColor(d.color, -0.3),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.layer, { transform: [{ translateY: depth }] }]}>
        <PolarChart
          data={shadowData}
          labelKey="name"
          valueKey="value"
          colorKey="color"
        >
          <Pie.Chart
            innerRadius={innerRadius}
            startAngle={startAngle}
            circleSweepDegrees={circleSweepDegrees}
          />
        </PolarChart>
      </View>

      <View style={styles.layer}>
        <PolarChart data={data} labelKey="name" valueKey="value" colorKey="color">
          <Pie.Chart
            innerRadius={innerRadius}
            startAngle={startAngle}
            circleSweepDegrees={circleSweepDegrees}
          />
        </PolarChart>
      </View>

      <View style={styles.legend}>
        {data.map((d) => (
          <View key={d.name} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: d.color }]} />
            <Text style={styles.legendText}>
              {d.name} {((d.value / total) * 100).toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent * 100);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return "#" + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  layer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  legend: {
    marginTop: 16,
    gap: 8,
    alignItems: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "500",
  },
});

export default PieChart3D;
