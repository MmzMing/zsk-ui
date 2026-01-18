import React from "react";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";

type AgreementModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function UserAgreementModal({ isOpen, onOpenChange }: AgreementModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
      backdrop="blur"
      placement="center"
      classNames={{
        base: "bg-[var(--bg-elevated)] text-[var(--text-color)]",
        header: "border-b border-[var(--border-color)]",
        body: "text-xs text-[var(--text-color-secondary)] leading-relaxed"
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="text-sm font-semibold">
              用户协议
            </ModalHeader>
            <ModalBody>
              <p>
                欢迎使用本网站提供的服务。为保障您的合法权益，请在使用前仔细阅读并充分理解本用户协议的全部内容，一旦您开始使用本网站，即视为您已阅读并同意本协议的全部条款。
              </p>
              <p>
                1. 您应保证在注册、使用过程中提交的信息真实、准确、完整，不得冒用他人身份或资料。
              </p>
              <p>
                2. 您在本站发布或上传的内容应遵守法律法规及公序良俗，不得发布违法、侵权、低俗等不当信息。
              </p>
              <p>
                3. 未经许可，您不得对本站提供的服务进行反向工程、恶意攻击、爬取数据或用于任何非法用途。
              </p>
              <p>
                如您对本协议的任何内容存在疑问，或不同意相关条款，请停止使用本网站服务。
              </p>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export function PrivacyPolicyModal({ isOpen, onOpenChange }: AgreementModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      scrollBehavior="inside"
      backdrop="blur"
      placement="center"
      classNames={{
        base: "bg-[var(--bg-elevated)] text-[var(--text-color)]",
        header: "border-b border-[var(--border-color)]",
        body: "text-xs text-[var(--text-color-secondary)] leading-relaxed"
      }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="text-sm font-semibold">
              隐私政策
            </ModalHeader>
            <ModalBody>
              <p>
                我们非常重视您的个人信息和隐私保护。在使用本站服务前，请您仔细阅读并充分理解本隐私政策的全部内容，以便了解我们如何收集、使用和保护您的个人信息。
              </p>
              <p>
                1. 我们仅在实现产品功能、优化体验或符合法律法规要求的前提下收集必要的信息，例如账号、联系方式、内容偏好等。
              </p>
              <p>
                2. 您在本站产生的内容及行为数据，将主要用于提供个性化服务、改进产品功能，不会用于与本服务无关的目的。
              </p>
              <p>
                3. 除法律法规另有规定或获得您的明确授权外，我们不会向第三方出售、出租或以其他方式提供您的个人信息。
              </p>
              <p>
                您可以在合理范围内查询、更正或删除相关信息，如对隐私政策存在疑问，可通过站内联系方式与我们取得沟通。
              </p>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

