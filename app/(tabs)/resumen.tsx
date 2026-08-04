import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { FilterChip } from "@/components/FilterChip";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SecondaryButton } from "@/components/SecondaryButton";
import { MonthlySummaryCard } from "@/components/summary/MonthlySummaryCard";
import { MonthlySummarySkeleton } from "@/components/summary/MonthlySummarySkeleton";
import {
  useGeneralPaymentService,
  useInvoiceService,
  useRetentionService,
  useTaxPaymentService,
} from "@/infrastructure/di/ServiceContext";
import { useMonthlySummary } from "@/hooks/useMonthlySummary";
import {
  radius,
  spacing,
  typography,
  useThemeColors,
  type Colors,
} from "@/theme";
import { formatMonthPeriod } from "@/utils/dates";
import { toErrorMessage } from "@/utils/errors";
import {
  DEFAULT_MONTHLY_REPORT_SECTIONS,
  MONTHLY_REPORT_SECTION_OPTIONS,
  buildMonthlyReport,
  hasSelectedMonthlyReportSection,
  type MonthlyReportSectionKey,
  type MonthlyReportSections,
} from "@/utils/monthlyReport";
import type { CombinedMonth } from "@/utils/monthlySummary";

type ReportStep = 0 | 1 | 2;

const REPORT_STEPS = ["Mes", "Datos", "Informe"] as const;

export default function SummaryScreen() {
  const { combined, isLoading, error, refresh } = useMonthlySummary();
  const invoiceService = useInvoiceService();
  const generalPaymentService = useGeneralPaymentService();
  const taxPaymentService = useTaxPaymentService();
  const retentionService = useRetentionService();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(
    new Set(),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportStep, setReportStep] = useState<ReportStep>(0);
  const [selectedReportPeriod, setSelectedReportPeriod] = useState<
    string | null
  >(null);
  const [reportSections, setReportSections] = useState<MonthlyReportSections>(
    () => ({ ...DEFAULT_MONTHLY_REPORT_SECTIONS }),
  );
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  useEffect(() => {
    if (combined.length === 0) {
      setSelectedReportPeriod(null);
      setGeneratedReport(null);
      return;
    }

    const hasSelectedPeriod = combined.some(
      (month) => month.period === selectedReportPeriod,
    );

    if (!selectedReportPeriod || !hasSelectedPeriod) {
      setSelectedReportPeriod(combined[0].period);
      setGeneratedReport(null);
    }
  }, [combined, selectedReportPeriod]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  const toggleExpand = useCallback((period: string) => {
    setExpandedPeriods((prev) => {
      const next = new Set(prev);
      if (next.has(period)) {
        next.delete(period);
      } else {
        next.add(period);
      }
      return next;
    });
  }, []);

  const selectReportPeriod = useCallback((period: string) => {
    setSelectedReportPeriod(period);
    setGeneratedReport(null);
  }, []);

  const toggleReportSection = useCallback((key: MonthlyReportSectionKey) => {
    setReportSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setGeneratedReport(null);
  }, []);

  const goToNextReportStep = useCallback(() => {
    if (reportStep === 0) {
      if (!selectedReportPeriod) {
        Alert.alert("Selecciona un mes", "Elige un mes para continuar.");
        return;
      }
      setReportStep(1);
      return;
    }

    if (reportStep === 1) {
      if (!hasSelectedMonthlyReportSection(reportSections)) {
        Alert.alert(
          "Selecciona datos",
          "Activa al menos una seccion para el informe.",
        );
        return;
      }
      setReportStep(2);
    }
  }, [reportSections, reportStep, selectedReportPeriod]);

  const goToPreviousReportStep = useCallback(() => {
    setReportStep((current) =>
      current > 0 ? ((current - 1) as ReportStep) : current,
    );
  }, []);

  const generateReport = useCallback(async () => {
    if (!selectedReportPeriod) {
      Alert.alert("Selecciona un mes", "Elige un mes para generar el informe.");
      setReportStep(0);
      return;
    }

    if (!hasSelectedMonthlyReportSection(reportSections)) {
      Alert.alert(
        "Selecciona datos",
        "Activa al menos una seccion para el informe.",
      );
      setReportStep(1);
      return;
    }

    const [year, month] = selectedReportPeriod.split("-");
    setIsGeneratingReport(true);

    try {
      const [invoices, taxPayments, generalPayments, retentions] =
        await Promise.all([
          invoiceService.getAll({ year, month }),
          taxPaymentService.getAll({ taxPeriod: selectedReportPeriod }),
          generalPaymentService.getAll({ year, month }),
          retentionService.getAll({ year, month }),
        ]);

      setGeneratedReport(
        buildMonthlyReport({
          period: selectedReportPeriod,
          sections: reportSections,
          invoices: reportSections.invoices ? invoices : [],
          taxPayments: reportSections.taxPayments ? taxPayments : [],
          generalPayments: reportSections.generalPayments
            ? generalPayments
            : [],
          retentions: reportSections.retentions ? retentions : [],
        }),
      );
    } catch (currentError) {
      Alert.alert(
        "No se pudo generar",
        toErrorMessage(currentError, "No se pudo generar el informe"),
      );
    } finally {
      setIsGeneratingReport(false);
    }
  }, [
    generalPaymentService,
    invoiceService,
    reportSections,
    retentionService,
    selectedReportPeriod,
    taxPaymentService,
  ]);

  const shareReport = useCallback(async () => {
    if (!generatedReport || !selectedReportPeriod) {
      return;
    }

    try {
      await Share.share({
        title: `Informe Factrion ${selectedReportPeriod}`,
        message: generatedReport,
      });
    } catch (currentError) {
      Alert.alert(
        "No se pudo compartir",
        toErrorMessage(currentError, "No se pudo compartir el informe"),
      );
    }
  }, [generatedReport, selectedReportPeriod]);

  const renderItem = useCallback(
    ({ item }: { item: CombinedMonth }) => (
      <MonthlySummaryCard
        summary={item}
        isExpanded={expandedPeriods.has(item.period)}
        isSmallScreen={isSmallScreen}
        onToggle={() => toggleExpand(item.period)}
      />
    ),
    [expandedPeriods, isSmallScreen, toggleExpand],
  );

  const keyExtractor = useCallback((item: CombinedMonth) => item.period, []);

  const ItemSeparatorComponent = useCallback(
    () => <View style={styles.separator} />,
    [styles],
  );

  if (error) {
    return (
      <ScreenContainer>
        <AppHeader title="Resumen" subtitle="Facturacion y pagos por mes" />
        <ErrorState message={error} onRetry={refresh} />
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer scrollable>
        <AppHeader title="Resumen" subtitle="Facturacion y pagos por mes" />
        <MonthlySummarySkeleton />
      </ScreenContainer>
    );
  }

  if (combined.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Resumen" subtitle="Facturacion y pagos por mes" />
        <EmptyState
          title="Sin resumen"
          message="Registra una factura, pago o retencion para construir el resumen."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppHeader title="Resumen" subtitle="Facturacion y pagos por mes" />
      <FlatList
        data={combined}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListHeaderComponent={
          <MonthlyReportStepper
            generatedReport={generatedReport}
            isGenerating={isGeneratingReport}
            onBack={goToPreviousReportStep}
            onGenerate={generateReport}
            onNext={goToNextReportStep}
            onPeriodChange={selectReportPeriod}
            onShare={shareReport}
            onToggleSection={toggleReportSection}
            periods={combined}
            sections={reportSections}
            selectedPeriod={selectedReportPeriod}
            step={reportStep}
          />
        }
        ListHeaderComponentStyle={styles.listHeader}
        refreshControl={
          <RefreshControl
            colors={[colors.primary.main]}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            tintColor={colors.primary.main}
          />
        }
      />
    </ScreenContainer>
  );
}

interface MonthlyReportStepperProps {
  periods: CombinedMonth[];
  selectedPeriod: string | null;
  sections: MonthlyReportSections;
  step: ReportStep;
  generatedReport: string | null;
  isGenerating: boolean;
  onPeriodChange: (period: string) => void;
  onToggleSection: (key: MonthlyReportSectionKey) => void;
  onNext: () => void;
  onBack: () => void;
  onGenerate: () => void;
  onShare: () => void;
}

function MonthlyReportStepper({
  periods,
  selectedPeriod,
  sections,
  step,
  generatedReport,
  isGenerating,
  onPeriodChange,
  onToggleSection,
  onNext,
  onBack,
  onGenerate,
  onShare,
}: MonthlyReportStepperProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const selectedSections = MONTHLY_REPORT_SECTION_OPTIONS.filter(
    ({ key }) => sections[key],
  );
  const canGenerate =
    Boolean(selectedPeriod) && hasSelectedMonthlyReportSection(sections);
  const primaryLabel =
    step === 2
      ? isGenerating
        ? "Generando..."
        : generatedReport
          ? "Regenerar informe"
          : "Generar informe"
      : "Siguiente";
  const primaryDisabled =
    step === 0
      ? !selectedPeriod
      : step === 1
        ? !hasSelectedMonthlyReportSection(sections)
        : isGenerating || !canGenerate;
  const primaryAction = step === 2 ? onGenerate : onNext;
  const selectedPeriodLabel = selectedPeriod
    ? formatMonthPeriod(selectedPeriod)
    : "Sin mes";

  return (
    <View style={styles.reportPanel}>
      <View style={styles.reportHeader}>
        <View>
          <Text style={styles.reportTitle}>Informe mensual</Text>
          <Text style={styles.reportSubtitle}>
            Paso {step + 1} de {REPORT_STEPS.length}
          </Text>
        </View>
      </View>

      <View style={styles.stepperRow}>
        {REPORT_STEPS.map((label, index) => {
          const isActive = index === step;
          const isDone = index < step;

          return (
            <View key={label} style={styles.stepperItem}>
              <View
                style={[
                  styles.stepCircle,
                  (isActive || isDone) && styles.stepCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    (isActive || isDone) && styles.stepNumberActive,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.stepBody}>
        {step === 0 ? (
          <>
            <Text style={styles.stepTitle}>Mes</Text>
            <View style={styles.chipGrid}>
              {periods.map((month) => (
                <FilterChip
                  key={month.period}
                  label={formatMonthPeriod(month.period)}
                  selected={selectedPeriod === month.period}
                  onPress={() => onPeriodChange(month.period)}
                />
              ))}
            </View>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Text style={styles.stepTitle}>Datos</Text>
            <View style={styles.chipGrid}>
              {MONTHLY_REPORT_SECTION_OPTIONS.map((option) => (
                <FilterChip
                  key={option.key}
                  label={option.label}
                  selected={sections[option.key]}
                  onPress={() => onToggleSection(option.key)}
                />
              ))}
            </View>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Text style={styles.stepTitle}>Informe</Text>
            <View style={styles.reportMetaBox}>
              <Text style={styles.reportMetaText}>{selectedPeriodLabel}</Text>
              <Text style={styles.reportMetaText}>
                {selectedSections.length > 0
                  ? selectedSections.map((option) => option.label).join(" / ")
                  : "Sin datos seleccionados"}
              </Text>
            </View>
            {generatedReport ? (
              <View style={styles.reportPreview}>
                <Text style={styles.previewTitle}>Vista previa</Text>
                <Text numberOfLines={14} style={styles.previewText}>
                  {generatedReport}
                </Text>
              </View>
            ) : null}
          </>
        ) : null}
      </View>

      <View style={styles.actionStack}>
        <PrimaryButton
          disabled={primaryDisabled}
          label={primaryLabel}
          onPress={primaryAction}
        />
        {step > 0 ? (
          <SecondaryButton
            disabled={isGenerating}
            label="Volver"
            onPress={onBack}
          />
        ) : null}
        {step === 2 && generatedReport ? (
          <SecondaryButton
            disabled={isGenerating}
            label="Compartir informe"
            onPress={onShare}
          />
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    listContent: {
      paddingBottom: 120,
    },
    listHeader: {
      marginBottom: spacing.lg,
    },
    separator: {
      height: spacing.lg,
    },
    reportPanel: {
      backgroundColor: c.surface.primary,
      borderColor: c.border.light,
      borderRadius: radius.card,
      borderWidth: 1,
      gap: spacing.lg,
      padding: spacing.cardPadding,
    },
    reportHeader: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    reportTitle: {
      ...typography.sectionTitle,
      color: c.text.primary,
    },
    reportSubtitle: {
      ...typography.caption,
      color: c.text.secondary,
      marginTop: spacing.xxs,
    },
    stepperRow: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: spacing.xs,
    },
    stepperItem: {
      alignItems: "center",
      flex: 1,
      gap: spacing.xs,
      minWidth: 0,
    },
    stepCircle: {
      alignItems: "center",
      backgroundColor: c.surface.secondary,
      borderColor: c.border.medium,
      borderRadius: 16,
      borderWidth: 1,
      height: 32,
      justifyContent: "center",
      width: 32,
    },
    stepCircleActive: {
      backgroundColor: c.primary.main,
      borderColor: c.primary.main,
    },
    stepNumber: {
      ...typography.label,
      color: c.text.secondary,
    },
    stepNumberActive: {
      color: c.text.inverse,
    },
    stepLabel: {
      ...typography.small,
      color: c.text.secondary,
      textAlign: "center",
    },
    stepLabelActive: {
      color: c.primary.main,
      fontWeight: "700",
    },
    stepBody: {
      gap: spacing.md,
    },
    stepTitle: {
      ...typography.cardTitle,
      color: c.text.primary,
    },
    chipGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    reportMetaBox: {
      backgroundColor: c.surface.secondary,
      borderColor: c.border.light,
      borderRadius: radius.inner,
      borderWidth: 1,
      gap: spacing.xs,
      padding: spacing.md,
    },
    reportMetaText: {
      ...typography.bodyMedium,
      color: c.text.primary,
    },
    reportPreview: {
      backgroundColor: c.background.tertiary,
      borderColor: c.border.light,
      borderRadius: radius.inner,
      borderWidth: 1,
      gap: spacing.xs,
      padding: spacing.md,
    },
    previewTitle: {
      ...typography.label,
      color: c.text.primary,
    },
    previewText: {
      ...typography.caption,
      color: c.text.secondary,
    },
    actionStack: {
      gap: spacing.sm,
    },
  });
