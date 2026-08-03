import { useWindowDimensions, View, type AccessibilityRole } from "react-native";
import { PieChart } from "react-native-chart-kit";

import { spacing, useThemeColors } from "../theme";

const rgba = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

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
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
}

export const PieChart3D: React.FC<PieChart3DProps> = ({ data, size, accessibilityLabel, accessibilityRole }) => {
  const { width } = useWindowDimensions();
  const colors = useThemeColors();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const availableWidth = width - spacing.screenPadding * 2;
  const chartSize = size
    ? Math.min(size, availableWidth)
    : Math.min(availableWidth, 350);

  const chartData = data.map((d) => {
    const pct = ((d.value / total) * 100).toFixed(1);
    return {
      name: `${d.name} ${pct}%`,
      population: d.value,
      color: d.color,
      legendFontColor: colors.chart.legend,
      legendFontSize: 11,
    };
  });

  return (
    <View
      accessibilityRole={accessibilityRole ?? "image"}
      accessibilityLabel={accessibilityLabel}
    >
      <PieChart
        data={chartData}
        width={chartSize}
        height={250}
        chartConfig={{
          color: (opacity = 1) => rgba(colors.chart.tooltipBg, opacity),
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 0]}
      />
    </View>
  );
};

export default PieChart3D;
